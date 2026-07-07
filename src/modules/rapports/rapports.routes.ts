// src/modules/rapports/rapports.routes.ts
//
// CORRECTIONS :
// FIX 1 : Split paiement dans parMode
// FIX 2 : calculerCoutRevient réutilise marges.service
// FIX 3 : Pagination take:500
// FIX 4 : Onglet credits/débiteurs
// FIX 5 : Comparaison N-1
// FIX 6 : resultatEstime avec charges fixes
// FIX 7 : stockGere respecté
// FIX 8 : Rapport stocks lots DLV

import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import prisma from "../../config/database";
import { calculerCoutRevient } from "../marges/marges.service";

const router = Router();
router.use(authMiddleware);

function getPeriode(req: Request) {
  const { dateDebut, dateFin } = req.query as { dateDebut?: string; dateFin?: string };
  const debut = dateDebut ? new Date(dateDebut) : (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
  const fin = dateFin ? new Date(new Date(dateFin).setHours(23, 59, 59, 999)) : new Date();
  return { gte: debut, lte: fin };
}

function getPeriodePrecedente(periode: { gte: Date; lte: Date }) {
  const duree = periode.lte.getTime() - periode.gte.getTime();
  return { gte: new Date(periode.gte.getTime() - duree), lte: new Date(periode.lte.getTime() - duree) };
}

function calculerParMode(ventes: any[]): Record<string, { count: number; montant: number }> {
  const parMode: Record<string, { count: number; montant: number }> = {};
  const add = (mode: string, montant: number, compteTransaction = false) => {
    if (!parMode[mode]) parMode[mode] = { count: 0, montant: 0 };
    parMode[mode].montant += montant;
    if (compteTransaction) parMode[mode].count++;
  };
  for (const v of ventes) {
    if ((v as any).splitPaiement && (v as any).split1Mode) {
      const m1 = (v as any).split1Mode;
      const m2 = (v as any).split2Mode;
      const a1 = (v as any).split1Montant ?? 0;
      const a2 = (v as any).split2Montant ?? (v.montantTotal - a1);
      add(m1, a1, true);
      if (m2 && a2 > 0) add(m2, a2, false);
    } else {
      add(v.modePaiement, v.montantTotal, true);
    }
  }
  return parMode;
}

router.get("/synthese",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const periode    = getPeriode(req);
    const precedente = getPeriodePrecedente(periode);
    const [ventesAgg, ventesPrec, pertesAgg, pertesPrec, productions, ventes, pertesMP, company] = await Promise.all([
      prisma.vente.aggregate({ where: { companyId, date: periode }, _sum: { montantTotal: true }, _count: true }),
      prisma.vente.aggregate({ where: { companyId, date: precedente }, _sum: { montantTotal: true }, _count: true }),
      prisma.perte.aggregate({ where: { companyId, date: periode }, _sum: { valeur: true }, _count: true }),
      prisma.perte.aggregate({ where: { companyId, date: precedente }, _sum: { valeur: true }, _count: true }),
      prisma.production.findMany({ where: { companyId, date: periode }, select: { pateTheorique: true, quantiteFarine: true }, take: 500 }),
      prisma.vente.findMany({ where: { companyId, date: periode }, select: { montantTotal: true, modePaiement: true, splitPaiement: true, split1Mode: true, split1Montant: true, split2Mode: true, split2Montant: true } as any, take: 500 }),
      prisma.mouvementStock.findMany({ where: { type: "SORTIE_PERTE_MP", mp: { companyId }, createdAt: periode }, include: { mp: { select: { prixAchat: true } } }, take: 500 }),
      prisma.company.findUnique({ where: { id: companyId }, select: { chargesFixesMensuelles: true, objectifCA: true, seuilPertes: true } as any }),
    ]);
    const coutPateJetee = pertesMP.reduce((s, m) => s + Math.abs(m.quantite) * (m.mp?.prixAchat ?? 0), 0);
    const caTotal       = ventesAgg._sum.montantTotal ?? 0;
    const caPrecedent   = ventesPrec._sum.montantTotal ?? 0;
    const pertesTotales = pertesAgg._sum.valeur ?? 0;
    const panierMoyen   = (ventesAgg._count ?? 0) > 0 ? caTotal / (ventesAgg._count ?? 1) : 0;
    const evolutionCA   = caPrecedent > 0 ? Math.round(((caTotal - caPrecedent) / caPrecedent) * 10000) / 100 : null;
    const evolutionPertes = (pertesPrec._sum.valeur ?? 0) > 0 ? Math.round(((pertesTotales - (pertesPrec._sum.valeur ?? 0)) / (pertesPrec._sum.valeur ?? 1)) * 10000) / 100 : null;
    const parMode = calculerParMode(ventes as any[]);
    const totalCredit = ventes.filter((v: any) => v.modePaiement === "A_CREDIT").reduce((s: number, v: any) => s + v.montantTotal, 0);
    const ecartMoyen = productions.length > 0 ? productions.reduce((s, p) => { const theo = p.pateTheorique; return s + (theo > 0 ? Math.abs(((p as any).pateEffective ?? theo) - theo) / theo * 100 : 0); }, 0) / productions.length : 0;
    const chargesFixes = (company as any)?.chargesFixesMensuelles ?? 0;
    const resultatEstime = Math.round(caTotal - coutPateJetee - pertesTotales - chargesFixes);
    res.json({ success: true, data: { ventes: { caTotal: Math.round(caTotal), caPrecedent: Math.round(caPrecedent), evolutionCA, nbTransactions: ventesAgg._count ?? 0, panierMoyen: Math.round(panierMoyen), totalCredit: Math.round(totalCredit), parMode }, marges: { coutPateJetee: Math.round(coutPateJetee), margeValeur: Math.round(caTotal - coutPateJetee), margePct: caTotal > 0 ? Math.round(((caTotal - coutPateJetee) / caTotal) * 10000) / 100 : 0, resultatEstime, chargesFixes: Math.round(chargesFixes), noteResultat: chargesFixes > 0 ? "CA moins pertes MP moins pertes produits moins charges fixes" : "CA moins pertes MP moins pertes produits" }, pertes: { valeurTotale: Math.round(pertesTotales), valeurPrecedent: Math.round(pertesPrec._sum.valeur ?? 0), nbPertes: pertesAgg._count ?? 0, evolutionPertes }, productions: { nbSessions: productions.length, totalFarine: Math.round(productions.reduce((s, p) => s + p.quantiteFarine, 0) * 100) / 100, ecartMoyenPct: Math.round(ecartMoyen * 100) / 100 }, alertes: { seuilPertes: (company as any)?.seuilPertes ?? 0, pertesDepasseSeuil: ((company as any)?.seuilPertes ?? 0) > 0 && pertesTotales > ((company as any)?.seuilPertes ?? 0), objectifCA: (company as any)?.objectifCA ?? 0, objectifAtteint: ((company as any)?.objectifCA ?? 0) > 0 && caTotal >= ((company as any)?.objectifCA ?? 0) } } });
  }
);

router.get("/ventes",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const periode = getPeriode(req);
    const ventes = await prisma.vente.findMany({ where: { companyId, date: periode }, include: { lignes: { include: { produit: { select: { id: true, nom: true, prixVente: true } } } }, user: { select: { prenom: true, nom: true } }, client: { select: { id: true, nom: true } } }, orderBy: { date: "desc" }, take: 500 }) as unknown as any[];
    const parProduit = new Map<string, { nom: string; quantite: number; ca: number }>();
    for (const vente of ventes) { for (const ligne of vente.lignes ?? []) { if (!ligne.produit) continue; const ex = parProduit.get(ligne.produitId); if (ex) { ex.quantite += ligne.quantite; ex.ca += ligne.sousTotal; } else parProduit.set(ligne.produitId, { nom: ligne.produit.nom, quantite: ligne.quantite, ca: ligne.sousTotal }); } }
    const classement = Array.from(parProduit.entries()).map(([id, d]) => ({ id, ...d })).sort((a, b) => b.ca - a.ca);
    const parMode = calculerParMode(ventes);
    const totalCredit = ventes.filter(v => v.modePaiement === "A_CREDIT").reduce((s, v) => s + v.montantTotal, 0);
    const parHeure: Record<number, number> = {};
    for (const v of ventes) { const h = new Date(v.date).getHours(); parHeure[h] = (parHeure[h] ?? 0) + v.montantTotal; }
    res.json({ success: true, data: { ventes, classement, parMode, totalCredit: Math.round(totalCredit), parHeure } });
  }
);

router.get("/marges",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const periode = getPeriode(req);
    const [produits, beurreMP] = await Promise.all([
      prisma.produit.findMany({ where: { companyId, actif: true }, include: { recette: { select: { id: true, nom: true, ratioPate: true, tauxPerte: true, categorie: true, estViennoiserie: true, ingredientReferenceNom: true, ingredientReferenceUnite: true, ingredients: { include: { mp: { select: { id: true, nom: true, prixAchat: true, stockGere: true } }, unite: { select: { abreviation: true, coefficient: true } } } } } }, lignesVente: { where: { vente: { date: periode } as any }, select: { quantite: true, sousTotal: true } }, categorie: { select: { nom: true, margeMin: true } } }, orderBy: { nom: "asc" } }) as unknown as any[],
      prisma.matierePremiere.findFirst({ where: { companyId, nom: { contains: "beurre", mode: "insensitive" }, actif: true }, select: { id: true, nom: true, prixAchat: true }, orderBy: { prixAchat: "desc" } }),
    ]);
    const sansRecette  = produits.filter((p: any) => !p.recetteId).length;
    const sansGrammage = produits.filter((p: any) => p.recetteId && (!p.grammage || p.grammage <= 0)).length;
    const marges = produits.filter((p: any) => (p.lignesVente?.length ?? 0) > 0).map((p: any) => {
      const qteVendue = (p.lignesVente ?? []).reduce((s: number, l: any) => s + l.quantite, 0);
      const caGenere  = (p.lignesVente ?? []).reduce((s: number, l: any) => s + l.sousTotal, 0);
      const calc = calculerCoutRevient(p, beurreMP);
      const coutRevient = calc.coutRevient;
      const coutTotal = Math.round(coutRevient * qteVendue);
      const margeVal  = Math.round(caGenere - coutTotal);
      const margePct  = caGenere > 0 ? Math.round((margeVal / caGenere) * 10000) / 100 : 0;
      const seuilMini = p.margeMin ?? p.categorie?.margeMin ?? 60;
      const alerteMarge = seuilMini > 0 && margePct < seuilMini;
      const prixConseille = alerteMarge && coutRevient > 0 ? Math.ceil(coutRevient / (1 - seuilMini / 100)) : null;
      return { id: p.id, nom: p.nom, grammage: p.grammage, prixVente: p.prixVente, qteVendue, caGenere: Math.round(caGenere), coutRevient, coutTotal, margeVal, margePct, seuilMini, alerteMarge, prixConseille, source: calc.source, methodeCout: calc.methodeCout };
    }).sort((a: any, b: any) => a.margePct - b.margePct);
    const margeMoyenne = marges.length > 0 ? marges.reduce((s: number, m: any) => s + m.margePct, 0) / marges.length : 0;
    res.json({ success: true, data: { marges, stats: { sansRecette, sansGrammage, nbAlerte: marges.filter((m: any) => m.alerteMarge).length, nbOk: marges.filter((m: any) => !m.alerteMarge).length, margeMoyenne: Math.round(margeMoyenne * 100) / 100 } } });
  }
);

router.get("/productions",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "CHEF_PATISSIER"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const periode = getPeriode(req);
    const productions = await prisma.production.findMany({ where: { companyId, date: periode }, include: { recette: { select: { nom: true, ratioPate: true } }, user: { select: { prenom: true, nom: true } }, lignesProduction: { include: { produit: { select: { nom: true, prixVente: true } } } } }, orderBy: { date: "desc" }, take: 500 }) as unknown as any[];
    const totalFarine = productions.reduce((s, p) => s + p.quantiteFarine, 0);
    const totalPateTheo = productions.reduce((s, p) => s + p.pateTheorique, 0);
    const totalPateEffective = productions.reduce((s, p) => s + (p.pateEffective ?? 0), 0);
    const totalPateGatee = productions.reduce((s, p) => s + (p.pateGatee ?? 0), 0);
    const totalPateRetournee = productions.reduce((s, p) => s + (p.pateRetournee ?? 0), 0);
    const ecartMoyen = productions.length > 0 ? productions.reduce((s, p) => { const theo = p.pateTheorique; return s + (theo > 0 ? Math.abs((p.pateEffective ?? theo) - theo) / theo * 100 : 0); }, 0) / productions.length : 0;
    const parRecetteMap = new Map<string, { nom: string; nbSessions: number; totalFarine: number; totalPieces: number; valeurEstimee: number }>();
    for (const p of productions) { const nom = p.recette?.nom ?? "Inconnue"; const ex = parRecetteMap.get(nom) ?? { nom, nbSessions: 0, totalFarine: 0, totalPieces: 0, valeurEstimee: 0 }; ex.nbSessions++; ex.totalFarine += p.quantiteFarine; for (const l of p.lignesProduction ?? []) { ex.totalPieces += l.quantite; ex.valeurEstimee += l.quantite * (l.produit?.prixVente ?? 0); } parRecetteMap.set(nom, ex); }
    const parSession: Record<string, number> = {};
    for (const p of productions) { const s = p.sessionProd ?? "INCONNU"; parSession[s] = (parSession[s] ?? 0) + 1; }
    res.json({ success: true, data: { productions, stats: { nbSessions: productions.length, totalFarine: Math.round(totalFarine * 100) / 100, totalPateTheo: Math.round(totalPateTheo * 100) / 100, totalPateEff: Math.round(totalPateEffective * 100) / 100, totalPateGatee: Math.round(totalPateGatee * 100) / 100, totalPateRet: Math.round(totalPateRetournee * 100) / 100, ecartMoyenPct: Math.round(ecartMoyen * 100) / 100, tauxPertePate: totalPateTheo > 0 ? Math.round((totalPateGatee / totalPateTheo) * 10000) / 100 : 0, parRecette: Array.from(parRecetteMap.values()), parSession } } });
  }
);

router.get("/pertes",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const periode = getPeriode(req);
    const pertes = await prisma.perte.findMany({ where: { companyId, date: periode }, include: { produit: { select: { nom: true } }, mp: { select: { nom: true } } }, orderBy: { date: "desc" }, take: 500 }) as unknown as any[];
    const totalValeur = pertes.reduce((s, p) => s + (p.valeur ?? 0), 0);
    const parType: Record<string, number> = {};
    const parCause: Record<string, number> = {};
    for (const p of pertes) { const t = p.type ?? "AUTRE"; const c = p.cause ?? "Inconnue"; parType[t] = (parType[t] ?? 0) + (p.valeur ?? 0); parCause[c] = (parCause[c] ?? 0) + (p.valeur ?? 0); }
    const topCauses = Object.entries(parCause).sort(([, a], [, b]) => b - a).slice(0, 5).map(([cause, valeur]) => ({ cause, valeur: Math.round(valeur) }));
    const parSemaine: Record<string, number> = {};
    for (const p of pertes) { const d = new Date(p.date); const lun = new Date(d); lun.setDate(d.getDate() - d.getDay() + 1); const key = lun.toISOString().split("T")[0]; parSemaine[key] = (parSemaine[key] ?? 0) + (p.valeur ?? 0); }
    res.json({ success: true, data: { pertes, stats: { totalValeur: Math.round(totalValeur), totalValeurProduits: Math.round(parType["PRODUIT_FINI"] ?? 0), totalValeurMP: Math.round(parType["MATIERE_PREMIERE"] ?? 0), nbPertes: pertes.length, parType, topCauses, parSemaine } } });
  }
);

router.get("/stocks",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const maintenant = new Date();
    const dans48h    = new Date(maintenant.getTime() + 48 * 60 * 60 * 1000);
    const [mps, produits, lotsProches, lotsExpires] = await Promise.all([
      prisma.matierePremiere.findMany({ where: { companyId, actif: true }, include: { categorie: { select: { nom: true } }, unite: { select: { abreviation: true } } }, orderBy: { nom: "asc" } }),
      prisma.produit.findMany({ where: { companyId, actif: true }, include: { categorie: { select: { nom: true } } }, orderBy: { nom: "asc" } }),
      (prisma as any).lotStock.findMany({ where: { companyId, statut: "ACTIF", quantiteRestante: { gt: 0 }, dateExpiration: { gte: maintenant, lte: dans48h } }, include: { produit: { select: { nom: true } } }, orderBy: { dateExpiration: "asc" } }),
      (prisma as any).lotStock.findMany({ where: { companyId, statut: "ACTIF", quantiteRestante: { gt: 0 }, dateExpiration: { lt: maintenant } }, include: { produit: { select: { nom: true } } }, orderBy: { dateExpiration: "asc" }, take: 50 }),
    ]);
    const valeurStockMP = (mps as any[]).reduce((s: number, m: any) => s + m.stockActuel * (m.prixAchat ?? 0), 0);
    const valeurStockPF = (produits as any[]).reduce((s: number, p: any) => s + p.stockActuel * (p.prixVente ?? 0), 0);
    const alertesMP = (mps as any[]).filter((m: any) => m.stockActuel <= (m.seuilAlerte ?? 0) && m.stockGere !== false).map((m: any) => ({ id: m.id, nom: m.nom, stockActuel: m.stockActuel, seuilAlerte: m.seuilAlerte, unite: m.unite?.abreviation ?? "kg", statut: m.stockActuel === 0 ? "RUPTURE" : "CRITIQUE" }));
    const alertesPF = (produits as any[]).filter((p: any) => p.stockActuel <= (p.seuilAlerte ?? 0)).map((p: any) => ({ id: p.id, nom: p.nom, stockActuel: p.stockActuel, seuilAlerte: p.seuilAlerte, statut: p.stockActuel === 0 ? "RUPTURE" : "BAS" }));
    res.json({ success: true, data: { mps, produits, valeurStockMP: Math.round(valeurStockMP), valeurStockPF: Math.round(valeurStockPF), valeurTotale: Math.round(valeurStockMP + valeurStockPF), alertesMP, alertesPF, lotsProches48h: lotsProches, lotsExpires, nbAlertesDLV: lotsProches.length + lotsExpires.length } });
  }
);

router.get("/credits",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const periode = getPeriode(req);
    const clients = await prisma.client.findMany({
      where:   { companyId } as any,
      include: {
        ventes: {
          where:   { modePaiement: "A_CREDIT", date: periode } as any,
          select:  { montantTotal: true, date: true },
          orderBy: { date: "desc" },
          take:    20,
        },
      },
      take: 100,
    }) as unknown as any[];
    const totalDu = 0;
    const nbDebiteurs = clients.length;
    const ventesCredit = await prisma.vente.findMany({ where: { companyId, modePaiement: "A_CREDIT", date: periode } as any, include: { client: { select: { id: true, nom: true, telephone: true } }, lignes: { include: { produit: { select: { nom: true } } } } }, orderBy: { date: "desc" }, take: 200 }) as unknown as any[];
    const totalCreditPeriode = ventesCredit.reduce((s: number, v: any) => s + v.montantTotal, 0);
    res.json({ success: true, data: { clients, ventesCredit, stats: { totalDu: Math.round(totalDu), totalCreditPeriode: Math.round(totalCreditPeriode), nbDebiteurs, nbVentesCredit: ventesCredit.length } } });
  }
);

router.get("/comparaison",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE", "COMPTABLE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const { dateDebut, dateFin } = req.query as Record<string, string>;
    if (!dateDebut || !dateFin) { res.status(400).json({ success: false, message: "dateDebut et dateFin requis" }); return; }
    const debut   = new Date(dateDebut);
    const fin     = new Date(new Date(dateFin).setHours(23, 59, 59, 999));
    const debutN1 = new Date(debut); debutN1.setFullYear(debutN1.getFullYear() - 1);
    const finN1   = new Date(fin);   finN1.setFullYear(finN1.getFullYear() - 1);
    const [ventesN, ventesN1, pertesN, pertesN1, prodN, prodN1] = await Promise.all([
      prisma.vente.aggregate({ where: { companyId, date: { gte: debut, lte: fin } }, _sum: { montantTotal: true }, _count: true }),
      prisma.vente.aggregate({ where: { companyId, date: { gte: debutN1, lte: finN1 } }, _sum: { montantTotal: true }, _count: true }),
      prisma.perte.aggregate({ where: { companyId, date: { gte: debut, lte: fin } }, _sum: { valeur: true } }),
      prisma.perte.aggregate({ where: { companyId, date: { gte: debutN1, lte: finN1 } }, _sum: { valeur: true } }),
      prisma.production.count({ where: { companyId, date: { gte: debut, lte: fin } as any } }),
      prisma.production.count({ where: { companyId, date: { gte: debutN1, lte: finN1 } as any } }),
    ]);
    const evolution = (ref: number, curr: number) => ref > 0 ? Math.round(((curr - ref) / ref) * 10000) / 100 : null;
    const caN = ventesN._sum.montantTotal ?? 0;
    const caN1 = ventesN1._sum.montantTotal ?? 0;
    const pN = pertesN._sum.valeur ?? 0;
    const pN1 = pertesN1._sum.valeur ?? 0;
    res.json({ success: true, data: { periodeN: { debut: dateDebut, fin: dateFin }, periodeN1: { debut: debutN1.toISOString().split("T")[0], fin: finN1.toISOString().split("T")[0] }, ca: { n: Math.round(caN), n1: Math.round(caN1), evolution: evolution(caN1, caN), transactions: { n: ventesN._count, n1: ventesN1._count } }, pertes: { n: Math.round(pN), n1: Math.round(pN1), evolution: evolution(pN1, pN) }, productions: { n: prodN, n1: prodN1, evolution: evolution(prodN1, prodN) } } });
  }
);

router.get("/marges/evolution/:produitId",
  requireRole(["ADMIN", "RESPONSABLE", "GESTIONNAIRE"]),
  async (req: Request, res: Response) => {
    const { companyId } = req.user!;
    const { produitId } = req.params;
    const il_y_a_6_mois = new Date();
    il_y_a_6_mois.setMonth(il_y_a_6_mois.getMonth() - 6);
    const lignes = await prisma.ligneVente.findMany({ where: { produitId, vente: { companyId, date: { gte: il_y_a_6_mois } } as any }, select: { quantite: true, sousTotal: true, vente: { select: { date: true } } }, orderBy: { vente: { date: "asc" } } as any, take: 500 }) as unknown as any[];
    const parMois: Record<string, { ca: number; qte: number }> = {};
    for (const l of lignes) { const key = new Date(l.vente.date).toISOString().slice(0, 7); if (!parMois[key]) parMois[key] = { ca: 0, qte: 0 }; parMois[key].ca += l.sousTotal; parMois[key].qte += l.quantite; }
    res.json({ success: true, data: { parMois, totalLignes: lignes.length } });
  }
);

export default router;
