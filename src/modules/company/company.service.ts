// ═══════════════════════════════════════════════════════════════
// src/modules/company/company.service.ts
// Gestion des infos de l'entreprise (paramètres)
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";

// Configurer Cloudinary pour l'upload de logos
if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// ─── Schéma de mise à jour ───────────────────────────────────────
export const updateCompanySchema = z.object({
  nom: z.string().min(2).optional(),
  type: z.string().optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  siteWeb: z.string().optional(),
  devise: z.string().optional(),
  couleurPrincipale: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format hex invalide (ex: #1a2744)")
    .optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

// ─── Récupérer les infos de l'entreprise ────────────────────────
export async function getCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    // Ne pas inclure les users (données sensibles)
    select: {
      id: true,
      nom: true,
      type: true,
      adresse: true,
      ville: true,
      pays: true,
      telephone: true,
      email: true,
      siteWeb: true,
      logoUrl: true,
      devise: true,
      couleurPrincipale: true,
      createdAt: true,
    },
  });

  if (!company) throw new AppError("Entreprise introuvable", 404);
  return company;
}

// ─── Mettre à jour les infos de l'entreprise ────────────────────
export async function updateCompany(
  companyId: string,
  data: UpdateCompanyInput
) {
  return prisma.company.update({
    where: { id: companyId },
    data,
  });
}

// ─── Uploader le logo ────────────────────────────────────────────
// Deux modes selon la configuration :
// 1. Si Cloudinary est configuré → upload sur le CDN (recommandé production)
// 2. Sinon → stockage base64 directement en BDD (mode développement)
//    Le logo est converti en Data URL et stocké dans logoUrl.
//    Avantage : aucune configuration externe requise.
//    Inconvénient : taille BDD plus grande (limiter à 500 Ko max).
export async function uploadLogo(
  companyId: string,
  fileBuffer: Buffer,
  mimetype: string
): Promise<string> {
  // ── MODE CLOUDINARY (si configuré dans .env) ──────────────────
  if (env.CLOUDINARY_CLOUD_NAME) {
    const base64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: `delice-pro/logos/${companyId}`,
      transformation: [
        { width: 200, height: 200, crop: "fit" },
        { format: "webp", quality: "auto" },
      ],
    });
    await prisma.company.update({
      where: { id: companyId },
      data: { logoUrl: result.secure_url },
    });
    return result.secure_url;
  }

  // ── MODE LOCAL (pas de Cloudinary) ───────────────────────────
  // Vérifier la taille du fichier (max 500 Ko pour la BDD)
  const maxSize = 500 * 1024; // 500 Ko en octets
  if (fileBuffer.length > maxSize) {
    throw new AppError(
      `Le logo est trop lourd (${Math.round(fileBuffer.length / 1024)} Ko). Maximum : 500 Ko. ` +
      `Compressez l'image avant de la télécharger.`,
      400
    );
  }

  // Convertir en Data URL base64 (format : "data:image/png;base64,xxx...")
  // Ce format peut être utilisé directement dans un <img src="...">
  const dataUrl = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

  // Sauvegarder la Data URL directement dans logoUrl
  await prisma.company.update({
    where: { id: companyId },
    data: { logoUrl: dataUrl },
  });

  return dataUrl;
}

// ─── Dashboard : données agrégées pour la page d'accueil ────────
export async function getDashboardData(companyId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // TOUTES les requêtes en parallèle — une seule Promise.all
  // Avant : 4 requêtes parallèles puis 1 séquentielle → 2 aller-retours BDD
  // Après : 5 requêtes parallèles → 1 seul aller-retour BDD
  const [
    ventesAujourdhui,
    pertesAujourdhui,
    productionsAujourdhui,
    alertesStock,
    topProduitsRaw,
    dernieresVentes,
  ] = await Promise.all([

    // CA et nb transactions du jour
    prisma.vente.aggregate({
      where: { companyId, date: { gte: today, lt: tomorrow } },
      _sum: { montantTotal: true },
      _count: true,
    }),

    // Pertes du jour
    prisma.perte.aggregate({
      where: { companyId, date: { gte: today, lt: tomorrow } },
      _sum: { valeur: true },
    }),

    // Productions du jour (on évite include coûteux — juste les champs nécessaires)
    prisma.production.findMany({
      where: { companyId, date: { gte: today, lt: tomorrow } },
      select: {
        id: true,
        pateTheorique: true,
        pateEffective: true,
        ecartPct: true,
        quantiteFarine: true,
        recette: { select: { nom: true } },
      },
    }),

    // MP en alerte de stock — utiliser une requête SQL brute plus rapide
    prisma.$queryRaw<{ id: string; nom: string; stockActuel: number; seuilAlerte: number }[]>`
      SELECT id, nom, "stockActuel", "seuilAlerte"
      FROM "MatierePremiere"
      WHERE "companyId" = ${companyId}
        AND actif = true
        AND "stockActuel" <= "seuilAlerte"
      LIMIT 20
    `,

    // Top produits du jour
    prisma.ligneVente.groupBy({
      by: ["produitId"],
      where: {
        vente: { companyId, date: { gte: today, lt: tomorrow } },
      },
      _sum:   { quantite: true, sousTotal: true },
      _count: true,
      orderBy: { _sum: { sousTotal: "desc" } },
      take: 5,
    }),

    // 5 dernières ventes avec lignes (simplifié)
    prisma.vente.findMany({
      where: { companyId },
      select: {
        id: true,
        montantTotal: true,
        modePaiement: true,
        date: true,
        lignes: {
          select: {
            quantite: true,
            sousTotal: true,
            produit: { select: { nom: true } },
          },
        },
        user: { select: { prenom: true, nom: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

    // Enrichir topProduits avec les noms
  const topProduitsIds = topProduitsRaw.map((t: any) => t.produitId);
  const topProduitsDetails = topProduitsIds.length > 0
    ? await prisma.produit.findMany({
        where: { id: { in: topProduitsIds } },
        select: { id: true, nom: true },
      })
    : [];
  const topProduits = topProduitsRaw.map((t: any) => ({
    produitId: t.produitId,
    nom:       topProduitsDetails.find((p: any) => p.id === t.produitId)?.nom ?? "—",
    quantite:  t._sum?.quantite ?? 0,
    ca:        Math.round(t._sum?.sousTotal ?? 0),
  }));

  // Objectif CA et seuil pertes depuis Company
  const companySettings = await prisma.company.findUnique({
    where:  { id: companyId },
    select: { objectifCA: true, seuilPertes: true } as any,
  });

  return {
    caAujourdhui:             ventesAujourdhui._sum.montantTotal ?? 0,
    nbTransactionsAujourdhui: ventesAujourdhui._count,
    pertesAujourdhui:         pertesAujourdhui._sum.valeur ?? 0,
    productionsAujourdhui,
    alertesStock,
    dernieresVentes,
    topProduits,
    objectifCA:   (companySettings as any)?.objectifCA  ?? 0,
    seuilPertes:  (companySettings as any)?.seuilPertes ?? 0,
  };
}