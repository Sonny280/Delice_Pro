// src/modules/recettes/recettes.service.ts

import { z } from "zod";
import prisma from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { calculerCoutRecette } from "../../utils/calculations";

// ─── Schémas ──────────────────────────────────────────────────────────────────

export const createRecetteSchema = z.object({
  nom:         z.string().min(2, "Le nom est requis"),
  description: z.string().optional(),
  ratioPate:   z.number().positive().default(1.0),
  tauxPerte:   z.number().min(0).max(100).default(0),
  categorie:   z.string().optional(),
  ingredients: z.array(z.object({
    mpId:     z.string().min(1),
    quantite: z.number().positive(),
    uniteId:  z.string().optional(),
  })).min(1),
});

export const updateRecetteSchema = createRecetteSchema.partial();
export type CreateRecetteInput = z.infer<typeof createRecetteSchema>;

// ─── Include standard ─────────────────────────────────────────────────────────

const includeComplet = {
  ingredients: {
    include: {
      mp:    { select: { id: true, nom: true, prixAchat: true, unite: { select: { abreviation: true } } } },
      unite: { select: { id: true, nom: true, abreviation: true, coefficient: true } },
    },
  },
  produits: {
    select: { id: true, nom: true, prixVente: true, grammage: true, margeMin: true },
  },
};

// ─── Enrichir avec les calculs ────────────────────────────────────────────────

async function enrichir(recette: any) {
  const coutMP = await calculerCoutRecette(recette.id);
  const ratio  = recette.ratioPate ?? 1;

  // Cout par kg de pate
  const coutParKgPate = ratio > 0 ? ((coutMP / ratio) * 100) / 100 : 0;

  // Calculs par produit
  const produitsAvecCalc = (recette.produits ?? []).map((p: any) => {
    if (!p.grammage || p.grammage <= 0) return { ...p, calc: null };

    const pateUtilisable   = ratio * 1000 * (1 - (recette.tauxPerte ?? 0) / 100);
    //const piecesParKgFarine = Math.round((pateUtilisable / p.grammage) * 100) / 100;

      const piecesParKgFarine = ((pateUtilisable / p.grammage) * 100) / 100;
   // const coutRevient       = piecesParKgFarine > 0 ? Math.round((coutMP / piecesParKgFarine) * 100) / 100 : 0;
   // const margeValeur       = Math.round((p.prixVente - coutRevient) * 100) / 100;
   // const margePct          = p.prixVente > 0 ? Math.round((margeValeur / p.prixVente) * 10000) / 100 : 0;

     const coutRevient       = piecesParKgFarine > 0 ? ((coutMP / piecesParKgFarine) * 100) / 100 : 0;
    const margeValeur       = ((p.prixVente - coutRevient) * 100) / 100;
    const margePct          = p.prixVente > 0 ? ((margeValeur / p.prixVente) * 10000) / 100 : 0;


    // Prix conseille pour atteindre la marge minimale
    const margeMin          = p.margeMin ?? 25;
    const prixConseille     = margePct < margeMin && coutRevient > 0
      ? Math.ceil(coutRevient / (1 - margeMin / 100))
      : null;

    return {
      ...p,
      calc: { piecesParKgFarine, coutRevient, margeValeur, margePct, prixConseille },
    };
  });

  return {
    ...recette,
    coutMP,
    coutParKgPate,
    produits: produitsAvecCalc,
  };
}

// ─── Lister les recettes ──────────────────────────────────────────────────────

export async function getRecettes(companyId: string) {
  const recettes = await prisma.recette.findMany({
    where:   { companyId, actif: true },
    include: includeComplet,
    orderBy: { nom: "asc" },
  });

  // Enrichir en parallele (evite N+1 sequentiel)
  return Promise.all(recettes.map(enrichir));
}

// ─── Créer une recette ────────────────────────────────────────────────────────

export async function createRecette(companyId: string, data: CreateRecetteInput) {
  const existing = await prisma.recette.findFirst({
    where: { nom: data.nom, companyId, actif: true },
  });
  if (existing) throw new AppError(`La recette "${data.nom}" existe déjà`, 409);

  const ingredientsBruts = data.ingredients.filter(
    ing => ing.mpId && ing.mpId.trim() !== "" && ing.quantite > 0
  );
  if (!ingredientsBruts.length) {
    throw new AppError("Ajoutez au moins un ingrédient avec une MP et une quantité > 0", 400);
  }

  // Valider chaque MP
  for (const ing of ingredientsBruts) {
    const mp = await prisma.matierePremiere.findFirst({ where: { id: ing.mpId, companyId } });
    if (!mp) throw new AppError(`Matière première introuvable (id: ${ing.mpId})`, 400);
    if (ing.uniteId?.trim()) {
      const unite = await prisma.unite.findFirst({ where: { id: ing.uniteId, companyId } });
      if (!unite) throw new AppError(`Unité introuvable (id: ${ing.uniteId})`, 400);
    }
  }

  const recette = await prisma.recette.create({
    data: {
      nom:         data.nom,
      description: data.description,
      ratioPate:   data.ratioPate,
      tauxPerte:   data.tauxPerte ?? 0,
      categorie:   data.categorie,
      companyId,
      ingredients: {
        create: ingredientsBruts.map(ing => ({
          mpId:     ing.mpId,
          quantite: ing.quantite,
          ...(ing.uniteId?.trim() ? { uniteId: ing.uniteId } : {}),
        })),
      },
    },
    include: includeComplet,
  });

  return enrichir(recette);
}

// ─── Mettre à jour une recette ────────────────────────────────────────────────

export async function updateRecette(
  recetteId: string,
  companyId: string,
  data: Partial<CreateRecetteInput>
) {
  const recette = await prisma.recette.findFirst({ where: { id: recetteId, companyId } });
  if (!recette) throw new AppError("Recette introuvable", 404);

  // Verifier unicite du nom si changement
  if (data.nom && data.nom !== recette.nom) {
    const existing = await prisma.recette.findFirst({
      where: { nom: data.nom, companyId, actif: true, NOT: { id: recetteId } },
    });
    if (existing) throw new AppError(`Une recette "${data.nom}" existe déjà`, 409);
  }

  if (data.ingredients) {
    
    const ingredientsValides = data.ingredients.filter(
      ing => ing.mpId && ing.mpId.trim() !== "" && ing.quantite > 0
    );
    // Supprimer + recréer les ingrédients dans une transaction
    await prisma.$transaction([
      prisma.recetteIngredient.deleteMany({ where: { recetteId } }),
      prisma.recette.update({
        where: { id: recetteId },
        data: {
          ...(data.nom         !== undefined ? { nom:         data.nom         } : {}),
          ...(data.ratioPate   !== undefined ? { ratioPate:   data.ratioPate   } : {}),
          ...(data.tauxPerte   !== undefined ? { tauxPerte:   data.tauxPerte   } : {}),
          ...(data.categorie   !== undefined ? { categorie:   data.categorie   } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ingredients: {
            create: ingredientsValides.map(ing => ({
              mpId:     ing.mpId,
              quantite: ing.quantite,
              ...(ing.uniteId?.trim() ? { uniteId: ing.uniteId } : {}),
            })),
          },
        },
      }),
    ]);
  } else {
    await prisma.recette.update({
      where: { id: recetteId },
      data: {
        ...(data.nom         !== undefined ? { nom:         data.nom         } : {}),
        ...(data.ratioPate   !== undefined ? { ratioPate:   data.ratioPate   } : {}),
        ...(data.tauxPerte   !== undefined ? { tauxPerte:   data.tauxPerte   } : {}),
        ...(data.categorie   !== undefined ? { categorie:   data.categorie   } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    });
  }

  const updated = await prisma.recette.findUnique({
    where:   { id: recetteId },
    include: includeComplet,
  });
  return enrichir(updated);
}

// ─── Dupliquer une recette ────────────────────────────────────────────────────

export async function dupliquerRecette(recetteId: string, companyId: string) {
  const source = await prisma.recette.findFirst({
    where:   { id: recetteId, companyId },
    include: { ingredients: true },
  });
  if (!source) throw new AppError("Recette source introuvable", 404);

  // Trouver un nom unique
  let nom = `${source.nom} (copie)`;
  let tentative = 1;
  while (await prisma.recette.findFirst({ where: { nom, companyId, actif: true } })) {
    tentative++;
    nom = `${source.nom} (copie ${tentative})`;
  }

  const copie = await prisma.recette.create({
    data: {
      nom,
      description: source.description,
      ratioPate:   source.ratioPate,
      tauxPerte:   (source as any).tauxPerte ?? 0,
      categorie:   (source as any).categorie,
      companyId,
      ingredients: {
        create: source.ingredients.map(ing => ({
          mpId:     ing.mpId,
          quantite: ing.quantite,
          ...(ing.uniteId ? { uniteId: ing.uniteId } : {}),
        })),
      },
    },
    include: includeComplet,
  });

  return enrichir(copie);
}

// ─── Archiver une recette (soft delete) ──────────────────────────────────────

export async function archiverRecette(recetteId: string, companyId: string) {
  const recette = await prisma.recette.findFirst({ where: { id: recetteId, companyId } });
  if (!recette) throw new AppError("Recette introuvable", 404);

  // Verifier qu'elle n'est pas utilisee dans une production recente (30 jours)
  const productionRecente = await prisma.production.findFirst({
    where: {
      recetteId,
      date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });
  if (productionRecente) {
    throw new AppError(
      "Cette recette a été utilisée dans une production récente (30 jours). Archivage impossible.",
      409
    );
  }

  return prisma.recette.update({
    where: { id: recetteId },
    data:  { actif: false },
  });
}