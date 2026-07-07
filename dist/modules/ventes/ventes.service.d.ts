import { z } from "zod";
export declare const createVenteSchema: z.ZodObject<{
    lignes: z.ZodArray<z.ZodObject<{
        produitId: z.ZodString;
        quantite: z.ZodNumber;
        prixUnitaire: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        quantite?: number;
        prixUnitaire?: number;
        produitId?: string;
    }, {
        quantite?: number;
        prixUnitaire?: number;
        produitId?: string;
    }>, "many">;
    modePaiement: z.ZodDefault<z.ZodEnum<["ESPECES", "MOBILE_MONEY", "CARTE_BANCAIRE", "VIREMENT", "A_CREDIT", "AUTRE"]>>;
    splitPaiement: z.ZodDefault<z.ZodBoolean>;
    split1Mode: z.ZodOptional<z.ZodEnum<["ESPECES", "MOBILE_MONEY", "CARTE_BANCAIRE", "VIREMENT"]>>;
    split1Montant: z.ZodOptional<z.ZodNumber>;
    split2Mode: z.ZodOptional<z.ZodEnum<["ESPECES", "MOBILE_MONEY", "CARTE_BANCAIRE", "VIREMENT", "A_CREDIT"]>>;
    split2Montant: z.ZodOptional<z.ZodNumber>;
    clientId: z.ZodOptional<z.ZodString>;
    nomClient: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    remiseMontant: z.ZodDefault<z.ZodNumber>;
    remisePct: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    nomClient?: string;
    notes?: string;
    remiseMontant?: number;
    remisePct?: number;
    modePaiement?: "ESPECES" | "MOBILE_MONEY" | "CARTE_BANCAIRE" | "VIREMENT" | "A_CREDIT" | "AUTRE";
    splitPaiement?: boolean;
    split1Mode?: "ESPECES" | "MOBILE_MONEY" | "CARTE_BANCAIRE" | "VIREMENT";
    split1Montant?: number;
    split2Mode?: "ESPECES" | "MOBILE_MONEY" | "CARTE_BANCAIRE" | "VIREMENT" | "A_CREDIT";
    split2Montant?: number;
    clientId?: string;
    lignes?: {
        quantite?: number;
        prixUnitaire?: number;
        produitId?: string;
    }[];
}, {
    date?: string;
    nomClient?: string;
    notes?: string;
    remiseMontant?: number;
    remisePct?: number;
    modePaiement?: "ESPECES" | "MOBILE_MONEY" | "CARTE_BANCAIRE" | "VIREMENT" | "A_CREDIT" | "AUTRE";
    splitPaiement?: boolean;
    split1Mode?: "ESPECES" | "MOBILE_MONEY" | "CARTE_BANCAIRE" | "VIREMENT";
    split1Montant?: number;
    split2Mode?: "ESPECES" | "MOBILE_MONEY" | "CARTE_BANCAIRE" | "VIREMENT" | "A_CREDIT";
    split2Montant?: number;
    clientId?: string;
    lignes?: {
        quantite?: number;
        prixUnitaire?: number;
        produitId?: string;
    }[];
}>;
export type CreateVenteInput = z.infer<typeof createVenteSchema>;
export declare function createVente(companyId: string, userId: string, data: CreateVenteInput): Promise<{
    user: {
        nom: string;
        prenom: string;
    };
    lignes: ({
        produit: {
            nom: string;
            dlvJours: number;
        };
    } & {
        id: string;
        quantite: number;
        prixUnitaire: number;
        sousTotal: number;
        venteId: string;
        produitId: string;
    })[];
} & {
    date: Date;
    companyId: string;
    id: string;
    createdAt: Date;
    userId: string;
    statut: string;
    nomClient: string | null;
    notes: string | null;
    montantTotal: number;
    montantBrut: number;
    remiseMontant: number;
    remisePct: number;
    modePaiement: import(".prisma/client").$Enums.ModePaiement;
    numero: number | null;
    motifAnnulation: string | null;
    splitPaiement: boolean;
    split1Mode: string | null;
    split1Montant: number | null;
    split2Mode: string | null;
    split2Montant: number | null;
    clientId: string | null;
}>;
export declare function getStatsVentes(companyId: string, options?: {
    dateDebut?: string;
    dateFin?: string;
}): Promise<{
    ventes: ({
        lignes: ({
            produit: {
                nom: string;
            };
        } & {
            id: string;
            quantite: number;
            prixUnitaire: number;
            sousTotal: number;
            venteId: string;
            produitId: string;
        })[];
    } & {
        date: Date;
        companyId: string;
        id: string;
        createdAt: Date;
        userId: string;
        statut: string;
        nomClient: string | null;
        notes: string | null;
        montantTotal: number;
        montantBrut: number;
        remiseMontant: number;
        remisePct: number;
        modePaiement: import(".prisma/client").$Enums.ModePaiement;
        numero: number | null;
        motifAnnulation: string | null;
        splitPaiement: boolean;
        split1Mode: string | null;
        split1Montant: number | null;
        split2Mode: string | null;
        split2Montant: number | null;
        clientId: string | null;
    })[];
    stats: {
        caTotale: number;
        nbTransactions: number;
        panierMoyen: number;
        topProduits: {
            nom: string;
            quantite: number;
            ca: number;
        }[];
        caParMode: Record<string, number>;
    };
}>;
export declare function ajouterStockProduit(companyId: string, produitId: string, quantite: number): Promise<{
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    recetteId: string | null;
    prixVente: number;
    prixAchat: number;
    margeMin: number;
    grammage: number | null;
    stockActuel: number;
    seuilAlerte: number;
    dlvJours: number;
    estSemiFini: boolean;
    categorieId: string | null;
}>;
export declare function getStockProduits(companyId: string): Promise<{
    statut: string;
    categorie: {
        nom: string;
        id: string;
    };
    recette: {
        nom: string;
        id: string;
    };
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    recetteId: string | null;
    prixVente: number;
    prixAchat: number;
    margeMin: number;
    grammage: number | null;
    stockActuel: number;
    seuilAlerte: number;
    dlvJours: number;
    estSemiFini: boolean;
    categorieId: string | null;
}[]>;
//# sourceMappingURL=ventes.service.d.ts.map