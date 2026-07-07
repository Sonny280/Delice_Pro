"use strict";
// src/modules/cloture/cloture.routes.ts
//
// NOUVEAU : Gestion des lots DLV expirés à la clôture
// ═══════════════════════════════════════════════════
//
// À la clôture :
//   1. Détection automatique des lots expirés (dateExpiration <= maintenant)
//   2. Passage en perte automatique des lots expirés non vendus
//   3. Le responsable peut aussi saisir des invendus manuels
//
// FIX : La route GET /produits retourne maintenant dlvJours
//   → Le frontend peut pré-remplir correctement les DLV=0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const database_1 = __importDefault(require("../../config/database"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// ─── Helpers ─────────────────────────────────────────────────────────────────
function debutJournee() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function finJournee() {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
}
function heureAutorisee(heureCloture) {
    const [h, m] = heureCloture.split(":").map(Number);
    const now = new Date();
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}
// ─── GET /api/cloture/produits ────────────────────────────────────────────────
// FIX : Retourne maintenant dlvJours pour le pré-remplissage automatique
// + Les lots expirés sont détectés et pré-calculés
router.get("/produits", async (req, res) => {
    const { companyId } = req.user;
    const maintenant = new Date();
    // Produits en stock
    const produits = await database_1.default.produit.findMany({
        where: { companyId, actif: true, stockActuel: { gt: 0 } },
        select: {
            id: true, nom: true, stockActuel: true,
            prixVente: true, grammage: true,
            dlvJours: true, // FIX : maintenant inclus
            estSemiFini: true, // Pour exclure les semi-finis du pré-remplissage
        },
        orderBy: { nom: "asc" },
    });
    // Lots expirés (DLV dépassé) avec quantité restante
    const lotsExpires = await database_1.default.lotStock.findMany({
        where: {
            companyId,
            statut: "ACTIF",
            quantiteRestante: { gt: 0 },
            dateExpiration: { lte: maintenant }, // DLV dépassé
        },
        include: {
            produit: { select: { id: true, nom: true, prixVente: true } },
        },
    });
    // Calculer pour chaque produit la quantité à passer en perte
    // En combinant : DLV=0 (tout le stock) + lots expirés
    const pertesSuggereesParProduit = {};
    // Lots expirés → ajouter la quantité restante
    for (const lot of lotsExpires) {
        const id = lot.produitId;
        pertesSuggereesParProduit[id] = (pertesSuggereesParProduit[id] ?? 0) + lot.quantiteRestante;
    }
    return res.json({
        success: true,
        data: produits.map(p => ({
            ...p,
            // Quantité suggérée en perte :
            // - Si DLV=0 : tout le stock (vente immédiate → invendu = perdu)
            // - Si lots expirés : quantité des lots expirés
            // - Sinon : 0 (responsable saisit manuellement)
            quantiteSuggeree: p.dlvJours === 0 && !p.estSemiFini
                ? p.stockActuel
                : (pertesSuggereesParProduit[p.id] ?? 0),
            aPerdreAutomatique: p.dlvJours === 0 && !p.estSemiFini,
            aLotsExpires: (pertesSuggereesParProduit[p.id] ?? 0) > 0,
        })),
        // Résumé des lots expirés (pour affichage informatif)
        lotsExpires: lotsExpires.map((lot) => ({
            produitNom: lot.produit?.nom,
            quantite: lot.quantiteRestante,
            dateCreation: lot.dateCreation,
            dateExpiration: lot.dateExpiration,
            dlvJours: lot.dlvJours,
        })),
    });
});
// ─── GET /api/cloture/statut ──────────────────────────────────────────────────
router.get("/statut", async (req, res) => {
    const { companyId } = req.user;
    const dejaFaite = await database_1.default.cloturJournee.findFirst({
        where: { companyId, date: { gte: debutJournee(), lte: finJournee() } },
    });
    const company = await database_1.default.company.findUnique({
        where: { id: companyId }, select: { heureCloture: true },
    });
    const heureCloture = company?.heureCloture ?? "17:00";
    res.json({
        success: true,
        data: {
            dejaFaite: !!dejaFaite,
            clotureDuJour: dejaFaite,
            heureCloture,
            peutCloturer: heureAutorisee(heureCloture),
        },
    });
});
// ─── GET /api/cloture/historique ─────────────────────────────────────────────
router.get("/historique", async (req, res) => {
    const clotures = await database_1.default.cloturJournee.findMany({
        where: { companyId: req.user.companyId },
        include: { user: { select: { prenom: true, nom: true } } },
        orderBy: { date: "desc" },
        take: 30,
    });
    res.json({ success: true, data: clotures });
});
// ─── POST /api/cloture/journee ───────────────────────────────────────────────
// Corps attendu :
//   invendus[]  : produits invendus manuels (quantiteInvendue > 0)
//   pertes[]    : pertes supplémentaires
//   fondCaisse  : montant compté en caisse
//   ecartFond   : différence avec le théorique
//   notes       : observations
router.post("/journee", (0, auth_middleware_1.requireRole)(["ADMIN", "RESPONSABLE", "CAISSIER"]), async (req, res) => {
    const { companyId, id: userId } = req.user;
    // Vérifier heure minimale
    const company = await database_1.default.company.findUnique({
        where: { id: companyId }, select: { heureCloture: true },
    });
    const heureCloture = company?.heureCloture ?? "17:00";
    if (!heureAutorisee(heureCloture)) {
        return res.status(400).json({
            success: false,
            message: `Clôture disponible à partir de ${heureCloture} seulement.`,
            heureCloture,
        });
    }
    // Vérifier double clôture
    const dejaFaite = await database_1.default.cloturJournee.findFirst({
        where: { companyId, date: { gte: debutJournee(), lte: finJournee() } },
    });
    if (dejaFaite) {
        return res.status(400).json({
            success: false,
            message: "La journée a déjà été clôturée aujourd'hui.",
            clotureDuJour: dejaFaite,
        });
    }
    // Valider le body
    const schema = zod_1.z.object({
        invendus: zod_1.z.array(zod_1.z.object({
            produitId: zod_1.z.string(),
            quantiteInvendue: zod_1.z.number().int().min(0),
            cause: zod_1.z.string().default("Invendu fin de journée"),
        })).default([]),
        pertes: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.enum(["PRODUIT_FINI", "MATIERE_PREMIERE"]),
            produitId: zod_1.z.string().optional(),
            mpId: zod_1.z.string().optional(),
            quantite: zod_1.z.number().positive(),
            cause: zod_1.z.string(),
        })).default([]),
        fondCaisse: zod_1.z.number().optional(),
        ecartFond: zod_1.z.number().optional(),
        notes: zod_1.z.string().optional(),
    });
    const { invendus, pertes, fondCaisse, ecartFond, notes } = schema.parse(req.body);
    const maintenant = new Date();
    // ── Bilan ventes du jour ──────────────────────────────────────────────────
    const ventesJour = await database_1.default.vente.findMany({
        where: { companyId, date: { gte: debutJournee(), lte: finJournee() } },
    });
    let caTotal = 0, totalEspeces = 0, totalMobile = 0;
    let totalCarte = 0, totalVirement = 0, totalCredit = 0;
    for (const v of ventesJour) {
        caTotal += v.montantTotal;
        if (v.modePaiement === "ESPECES")
            totalEspeces += v.montantTotal;
        if (v.modePaiement === "MOBILE_MONEY")
            totalMobile += v.montantTotal;
        if (v.modePaiement === "CARTE_BANCAIRE")
            totalCarte += v.montantTotal;
        if (v.modePaiement === "VIREMENT")
            totalVirement += v.montantTotal;
        if (v.modePaiement === "A_CREDIT")
            totalCredit += v.montantTotal;
    }
    // ── NOUVEAU : Lots expirés → perte automatique ───────────────────────────
    // Chercher tous les lots actifs dont le DLV est dépassé
    const lotsExpires = await database_1.default.lotStock.findMany({
        where: {
            companyId,
            statut: "ACTIF",
            quantiteRestante: { gt: 0 },
            dateExpiration: { lte: maintenant },
        },
        include: {
            produit: { select: { id: true, nom: true, prixVente: true } },
        },
    });
    let nbInvendusAuto = 0, valeurInvendusAuto = 0;
    for (const lot of lotsExpires) {
        if (!lot.produit || lot.quantiteRestante <= 0)
            continue;
        const valeur = Math.round(lot.produit.prixVente * lot.quantiteRestante);
        valeurInvendusAuto += valeur;
        nbInvendusAuto++;
        // Créer la perte
        await database_1.default.perte.create({
            data: {
                companyId,
                type: "PRODUIT_FINI",
                produitId: lot.produitId,
                quantite: lot.quantiteRestante,
                valeur,
                cause: `DLV expiré (${lot.dlvJours}j) — lot du ${new Date(lot.dateCreation).toLocaleDateString("fr-FR")}`,
                deductMP: false,
                date: maintenant,
                notes: `Clôture ${maintenant.toLocaleDateString("fr-FR")} — lot automatique`,
            },
        });
        // Décrémenter le stock produit
        await database_1.default.produit.update({
            where: { id: lot.produitId },
            data: { stockActuel: { decrement: lot.quantiteRestante } },
        });
        // Marquer le lot comme expiré
        await database_1.default.lotStock.update({
            where: { id: lot.id },
            data: {
                statut: "EXPIRE",
                quantiteRestante: 0,
                notesExpiration: `Clôture ${maintenant.toLocaleDateString("fr-FR")}`,
            },
        });
    }
    // ── Invendus manuels ──────────────────────────────────────────────────────
    let nbInvendus = nbInvendusAuto, valeurInvendus = valeurInvendusAuto;
    for (const inv of invendus) {
        if (inv.quantiteInvendue <= 0)
            continue;
        const produit = await database_1.default.produit.findFirst({
            where: { id: inv.produitId, companyId },
        });
        if (!produit)
            continue;
        const valeur = Math.round(produit.prixVente * inv.quantiteInvendue);
        valeurInvendus += valeur;
        nbInvendus++;
        await database_1.default.perte.create({
            data: {
                companyId,
                type: "PRODUIT_FINI",
                produitId: inv.produitId,
                quantite: inv.quantiteInvendue,
                valeur,
                cause: inv.cause,
                deductMP: false,
                date: maintenant,
                notes: `Clôture ${maintenant.toLocaleDateString("fr-FR")}`,
            },
        });
        // Marquer les lots restants de ce produit comme épuisés/expirés
        // (le responsable a déclaré les invendus manuellement)
        await database_1.default.lotStock.updateMany({
            where: {
                companyId, produitId: inv.produitId, statut: "ACTIF",
                quantiteRestante: { gt: 0 },
            },
            data: {
                statut: "EXPIRE",
                quantiteRestante: 0,
                notesExpiration: `Invendu manuel clôture ${maintenant.toLocaleDateString("fr-FR")}`,
            },
        });
        await database_1.default.produit.update({
            where: { id: inv.produitId },
            data: { stockActuel: { decrement: inv.quantiteInvendue } },
        });
    }
    // ── Pertes manuelles ──────────────────────────────────────────────────────
    let nbPertes = 0, valeurPertes = 0;
    for (const perte of pertes) {
        if (perte.type === "PRODUIT_FINI" && perte.produitId) {
            const produit = await database_1.default.produit.findFirst({
                where: { id: perte.produitId, companyId },
            });
            if (!produit)
                continue;
            const valeur = Math.round(produit.prixVente * perte.quantite);
            valeurPertes += valeur;
            nbPertes++;
            await database_1.default.perte.create({
                data: {
                    companyId, type: "PRODUIT_FINI", produitId: perte.produitId,
                    quantite: perte.quantite, valeur, cause: perte.cause,
                    deductMP: true, date: maintenant,
                    notes: `Perte clôture ${maintenant.toLocaleDateString("fr-FR")}`,
                },
            });
            await database_1.default.produit.update({
                where: { id: perte.produitId },
                data: { stockActuel: { decrement: perte.quantite } },
            });
        }
        if (perte.type === "MATIERE_PREMIERE" && perte.mpId) {
            const mp = await database_1.default.matierePremiere.findFirst({
                where: { id: perte.mpId, companyId },
            });
            if (!mp || mp.stockGere === false)
                continue;
            const valeur = Math.round(mp.prixAchat * perte.quantite);
            valeurPertes += valeur;
            nbPertes++;
            await database_1.default.perte.create({
                data: {
                    companyId, type: "MATIERE_PREMIERE", mpId: perte.mpId,
                    quantite: perte.quantite, valeur, cause: perte.cause,
                    deductMP: true, date: maintenant,
                    notes: `Perte clôture ${maintenant.toLocaleDateString("fr-FR")}`,
                },
            });
            await database_1.default.matierePremiere.update({
                where: { id: perte.mpId },
                data: { stockActuel: { decrement: perte.quantite } },
            });
            await database_1.default.mouvementStock.create({
                data: {
                    mpId: perte.mpId, type: "SORTIE_PERTE_MP",
                    quantite: perte.quantite, motif: `Perte clôture : ${perte.cause}`,
                },
            });
        }
    }
    // ── Créer la clôture ──────────────────────────────────────────────────────
    const cloture = await database_1.default.cloturJournee.create({
        data: {
            companyId, userId,
            date: debutJournee(),
            heureRealisation: maintenant,
            caTotal: Math.round(caTotal),
            nbTransactions: ventesJour.length,
            totalEspeces: Math.round(totalEspeces),
            totalMobile: Math.round(totalMobile),
            totalCarte: Math.round(totalCarte),
            totalVirement: Math.round(totalVirement),
            totalCredit: Math.round(totalCredit),
            nbInvendus,
            valeurInvendus: Math.round(valeurInvendus),
            nbPertes,
            valeurPertes: Math.round(valeurPertes),
            fondCaisse: fondCaisse ?? null,
            ecartFond: ecartFond ?? null,
            notes,
        },
    });
    return res.status(201).json({
        success: true,
        data: {
            cloture,
            resume: {
                caTotal: Math.round(caTotal),
                nbTransactions: ventesJour.length,
                totalEspeces: Math.round(totalEspeces),
                totalMobile: Math.round(totalMobile),
                totalCarte: Math.round(totalCarte),
                totalCredit: Math.round(totalCredit),
                nbInvendus,
                valeurInvendus: Math.round(valeurInvendus),
                nbInvendusAuto, // Nombre de lots passés automatiquement
                valeurInvendusAuto: Math.round(valeurInvendusAuto),
                nbPertes,
                valeurPertes: Math.round(valeurPertes),
                fondCaisse: fondCaisse ?? null,
                ecartFond: ecartFond ?? null,
            },
        },
    });
});
exports.default = router;
//# sourceMappingURL=cloture.routes.js.map