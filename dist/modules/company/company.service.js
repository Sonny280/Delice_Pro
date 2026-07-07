"use strict";
// ═══════════════════════════════════════════════════════════════
// src/modules/company/company.service.ts
// Gestion des infos de l'entreprise (paramètres)
// ═══════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanySchema = void 0;
exports.getCompany = getCompany;
exports.updateCompany = updateCompany;
exports.uploadLogo = uploadLogo;
exports.getDashboardData = getDashboardData;
const zod_1 = require("zod");
const cloudinary_1 = require("cloudinary");
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const error_middleware_1 = require("../../middleware/error.middleware");
// Configurer Cloudinary pour l'upload de logos
if (env_1.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
}
// ─── Schéma de mise à jour ───────────────────────────────────────
exports.updateCompanySchema = zod_1.z.object({
    nom: zod_1.z.string().min(2).optional(),
    type: zod_1.z.string().optional(),
    adresse: zod_1.z.string().optional(),
    ville: zod_1.z.string().optional(),
    pays: zod_1.z.string().optional(),
    telephone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    siteWeb: zod_1.z.string().optional(),
    devise: zod_1.z.string().optional(),
    couleurPrincipale: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Format hex invalide (ex: #1a2744)")
        .optional(),
});
// ─── Récupérer les infos de l'entreprise ────────────────────────
async function getCompany(companyId) {
    const company = await database_1.default.company.findUnique({
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
    if (!company)
        throw new error_middleware_1.AppError("Entreprise introuvable", 404);
    return company;
}
// ─── Mettre à jour les infos de l'entreprise ────────────────────
async function updateCompany(companyId, data) {
    return database_1.default.company.update({
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
async function uploadLogo(companyId, fileBuffer, mimetype) {
    // ── MODE CLOUDINARY (si configuré dans .env) ──────────────────
    if (env_1.env.CLOUDINARY_CLOUD_NAME) {
        const base64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
        const result = await cloudinary_1.v2.uploader.upload(base64, {
            folder: `delice-pro/logos/${companyId}`,
            transformation: [
                { width: 200, height: 200, crop: "fit" },
                { format: "webp", quality: "auto" },
            ],
        });
        await database_1.default.company.update({
            where: { id: companyId },
            data: { logoUrl: result.secure_url },
        });
        return result.secure_url;
    }
    // ── MODE LOCAL (pas de Cloudinary) ───────────────────────────
    // Vérifier la taille du fichier (max 500 Ko pour la BDD)
    const maxSize = 500 * 1024; // 500 Ko en octets
    if (fileBuffer.length > maxSize) {
        throw new error_middleware_1.AppError(`Le logo est trop lourd (${Math.round(fileBuffer.length / 1024)} Ko). Maximum : 500 Ko. ` +
            `Compressez l'image avant de la télécharger.`, 400);
    }
    // Convertir en Data URL base64 (format : "data:image/png;base64,xxx...")
    // Ce format peut être utilisé directement dans un <img src="...">
    const dataUrl = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    // Sauvegarder la Data URL directement dans logoUrl
    await database_1.default.company.update({
        where: { id: companyId },
        data: { logoUrl: dataUrl },
    });
    return dataUrl;
}
// ─── Dashboard : données agrégées pour la page d'accueil ────────
async function getDashboardData(companyId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // TOUTES les requêtes en parallèle — une seule Promise.all
    // Avant : 4 requêtes parallèles puis 1 séquentielle → 2 aller-retours BDD
    // Après : 5 requêtes parallèles → 1 seul aller-retour BDD
    const [ventesAujourdhui, pertesAujourdhui, productionsAujourdhui, alertesStock, topProduitsRaw, dernieresVentes,] = await Promise.all([
        // CA et nb transactions du jour
        database_1.default.vente.aggregate({
            where: { companyId, date: { gte: today, lt: tomorrow } },
            _sum: { montantTotal: true },
            _count: true,
        }),
        // Pertes du jour
        database_1.default.perte.aggregate({
            where: { companyId, date: { gte: today, lt: tomorrow } },
            _sum: { valeur: true },
        }),
        // Productions du jour (on évite include coûteux — juste les champs nécessaires)
        database_1.default.production.findMany({
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
        database_1.default.$queryRaw `
      SELECT id, nom, "stockActuel", "seuilAlerte"
      FROM "MatierePremiere"
      WHERE "companyId" = ${companyId}
        AND actif = true
        AND "stockActuel" <= "seuilAlerte"
      LIMIT 20
    `,
        // Top produits du jour
        database_1.default.ligneVente.groupBy({
            by: ["produitId"],
            where: {
                vente: { companyId, date: { gte: today, lt: tomorrow } },
            },
            _sum: { quantite: true, sousTotal: true },
            _count: true,
            orderBy: { _sum: { sousTotal: "desc" } },
            take: 5,
        }),
        // 5 dernières ventes avec lignes (simplifié)
        database_1.default.vente.findMany({
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
    const topProduitsIds = topProduitsRaw.map((t) => t.produitId);
    const topProduitsDetails = topProduitsIds.length > 0
        ? await database_1.default.produit.findMany({
            where: { id: { in: topProduitsIds } },
            select: { id: true, nom: true },
        })
        : [];
    const topProduits = topProduitsRaw.map((t) => ({
        produitId: t.produitId,
        nom: topProduitsDetails.find((p) => p.id === t.produitId)?.nom ?? "—",
        quantite: t._sum?.quantite ?? 0,
        ca: Math.round(t._sum?.sousTotal ?? 0),
    }));
    // Objectif CA et seuil pertes depuis Company
    const companySettings = await database_1.default.company.findUnique({
        where: { id: companyId },
        select: { objectifCA: true, seuilPertes: true },
    });
    return {
        caAujourdhui: ventesAujourdhui._sum.montantTotal ?? 0,
        nbTransactionsAujourdhui: ventesAujourdhui._count,
        pertesAujourdhui: pertesAujourdhui._sum.valeur ?? 0,
        productionsAujourdhui,
        alertesStock,
        dernieresVentes,
        topProduits,
        objectifCA: companySettings?.objectifCA ?? 0,
        seuilPertes: companySettings?.seuilPertes ?? 0,
    };
}
//# sourceMappingURL=company.service.js.map