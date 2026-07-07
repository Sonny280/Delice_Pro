import { z } from "zod";
export declare const enregistrerProductionSchema: z.ZodObject<{
    recetteId: z.ZodString;
    numeroPetrin: z.ZodDefault<z.ZodNumber>;
    sessionProd: z.ZodDefault<z.ZodEnum<["NUIT", "JOUR"]>>;
    nomPetrisseur: z.ZodOptional<z.ZodString>;
    heureDebut: z.ZodOptional<z.ZodString>;
    heureFin: z.ZodOptional<z.ZodString>;
    categorieProd: z.ZodDefault<z.ZodEnum<["BOULANGERIE", "VIENNOISERIE_PETRISSAGE", "PATISSERIE"]>>;
    typeProduction: z.ZodDefault<z.ZodEnum<["VENTE", "COMMANDE"]>>;
    nomClient: z.ZodOptional<z.ZodString>;
    quantiteFarine: z.ZodNumber;
    pateRecuperee: z.ZodDefault<z.ZodNumber>;
    pateEffective: z.ZodNumber;
    pateRetournee: z.ZodDefault<z.ZodNumber>;
    pateGatee: z.ZodDefault<z.ZodNumber>;
    causeGatee: z.ZodOptional<z.ZodString>;
    estDernierPetrin: z.ZodDefault<z.ZodBoolean>;
    pateGardee: z.ZodDefault<z.ZodNumber>;
    destinationPateGardee: z.ZodOptional<z.ZodEnum<["recuperee_demain", "gatee"]>>;
    lignes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        produitId: z.ZodString;
        quantite: z.ZodNumber;
        poidsUnitaire: z.ZodNumber;
        mettreEnStock: z.ZodDefault<z.ZodBoolean>;
        dlvJours: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        quantite?: number;
        produitId?: string;
        dlvJours?: number;
        poidsUnitaire?: number;
        mettreEnStock?: boolean;
    }, {
        quantite?: number;
        produitId?: string;
        dlvJours?: number;
        poidsUnitaire?: number;
        mettreEnStock?: boolean;
    }>, "many">>;
    patons: z.ZodDefault<z.ZodArray<z.ZodObject<{
        poids: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        poids?: number;
    }, {
        poids?: number;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patons?: {
        poids?: number;
    }[];
    numeroPetrin?: number;
    sessionProd?: "NUIT" | "JOUR";
    nomPetrisseur?: string;
    heureDebut?: string;
    heureFin?: string;
    quantiteFarine?: number;
    pateEffective?: number;
    pateRetournee?: number;
    pateRecuperee?: number;
    pateGatee?: number;
    causeGatee?: string;
    pateGardee?: number;
    destinationPateGardee?: "recuperee_demain" | "gatee";
    categorieProd?: "BOULANGERIE" | "VIENNOISERIE_PETRISSAGE" | "PATISSERIE";
    typeProduction?: "VENTE" | "COMMANDE";
    nomClient?: string;
    notes?: string;
    recetteId?: string;
    lignes?: {
        quantite?: number;
        produitId?: string;
        dlvJours?: number;
        poidsUnitaire?: number;
        mettreEnStock?: boolean;
    }[];
    estDernierPetrin?: boolean;
}, {
    patons?: {
        poids?: number;
    }[];
    numeroPetrin?: number;
    sessionProd?: "NUIT" | "JOUR";
    nomPetrisseur?: string;
    heureDebut?: string;
    heureFin?: string;
    quantiteFarine?: number;
    pateEffective?: number;
    pateRetournee?: number;
    pateRecuperee?: number;
    pateGatee?: number;
    causeGatee?: string;
    pateGardee?: number;
    destinationPateGardee?: "recuperee_demain" | "gatee";
    categorieProd?: "BOULANGERIE" | "VIENNOISERIE_PETRISSAGE" | "PATISSERIE";
    typeProduction?: "VENTE" | "COMMANDE";
    nomClient?: string;
    notes?: string;
    recetteId?: string;
    lignes?: {
        quantite?: number;
        produitId?: string;
        dlvJours?: number;
        poidsUnitaire?: number;
        mettreEnStock?: boolean;
    }[];
    estDernierPetrin?: boolean;
}>;
export declare function enregistrerProduction(companyId: string, userId: string, data: z.infer<typeof enregistrerProductionSchema>): Promise<{
    production: {
        difference: number;
        ecartPct: number;
        date: Date;
        companyId: string;
        id: string;
        createdAt: Date;
        userId: string;
        numeroPetrin: number;
        sessionProd: string;
        nomPetrisseur: string | null;
        heureDebut: Date | null;
        heureFin: Date | null;
        quantiteFarine: number;
        pateTheorique: number;
        pateEffective: number;
        pateRetournee: number;
        pateRecuperee: number;
        pateGatee: number;
        causeGatee: string | null;
        pateGardee: number;
        destinationPateGardee: string | null;
        categorieProd: import(".prisma/client").$Enums.CategorieProd;
        statut: import(".prisma/client").$Enums.StatutProduction;
        typeProduction: import(".prisma/client").$Enums.TypeProduction;
        nomClient: string | null;
        dateTerminaison: Date | null;
        notes: string | null;
        recetteId: string;
    };
    pateTheorique: number;
    pateEffective: number;
    difference: number;
    ecartPct: number;
    totalPieces: number;
    nbPatons: number;
    nbLots: number;
    alertesStock: {
        mp: string;
        stockActuel: number;
        besoin: number;
        manque: number;
    }[];
    alerteEcart: {
        niveau: string;
        message: string;
        ecartPct: number;
        difference: number;
    };
    lots: {
        produitId: any;
        quantite: any;
        dateCreation: any;
        dateExpiration: any;
        dlvJours: any;
    }[];
    message: string;
}>;
export declare const faconnerPatonSchema: z.ZodObject<{
    patonId: z.ZodString;
    produitId: z.ZodString;
    poidsBeurre: z.ZodDefault<z.ZodNumber>;
    nbPieces: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string;
    produitId?: string;
    poidsBeurre?: number;
    nbPieces?: number;
    patonId?: string;
}, {
    notes?: string;
    produitId?: string;
    poidsBeurre?: number;
    nbPieces?: number;
    patonId?: string;
}>;
export declare function faconnerPaton(companyId: string, data: z.infer<typeof faconnerPatonSchema>): Promise<{
    rendement: number;
    dlvJours: number;
    dateExpiration: Date;
    message: string;
}>;
export declare function getLotsActifs(companyId: string, produitId?: string): Promise<any>;
export declare function getPatonsEnChambreFroide(companyId: string): Promise<any[]>;
export declare function getDerniereRetournee(companyId: string): Promise<{
    [x: string]: ({
        companyId: string;
        id: string;
        createdAt: Date;
        produitId: string | null;
        poids: number;
        poidsBeurre: number;
        poidsTotal: number;
        nbPieces: number;
        rendement: number;
        statutPaton: import(".prisma/client").$Enums.StatutPaton;
        dateFaconnage: Date | null;
        productionId: string;
    } | {
        companyId: string;
        id: string;
        createdAt: Date;
        produitId: string | null;
        poids: number;
        poidsBeurre: number;
        poidsTotal: number;
        nbPieces: number;
        rendement: number;
        statutPaton: import(".prisma/client").$Enums.StatutPaton;
        dateFaconnage: Date | null;
        productionId: string;
    })[] | ({
        companyId: string;
        id: string;
        createdAt: Date;
        statut: import(".prisma/client").$Enums.StatutLot;
        produitId: string;
        dlvJours: number;
        productionId: string | null;
        quantiteInitiale: number;
        quantiteRestante: number;
        dateCreation: Date;
        dateExpiration: Date;
        notesExpiration: string | null;
    } | {
        companyId: string;
        id: string;
        createdAt: Date;
        statut: import(".prisma/client").$Enums.StatutLot;
        produitId: string;
        dlvJours: number;
        productionId: string | null;
        quantiteInitiale: number;
        quantiteRestante: number;
        dateCreation: Date;
        dateExpiration: Date;
        notesExpiration: string | null;
    })[] | {
        companyId: string;
        id: string;
        createdAt: Date;
        produitId: string | null;
        poids: number;
        poidsBeurre: number;
        poidsTotal: number;
        nbPieces: number;
        rendement: number;
        statutPaton: import(".prisma/client").$Enums.StatutPaton;
        dateFaconnage: Date | null;
        productionId: string;
    }[] | {
        companyId: string;
        id: string;
        createdAt: Date;
        statut: import(".prisma/client").$Enums.StatutLot;
        produitId: string;
        dlvJours: number;
        productionId: string | null;
        quantiteInitiale: number;
        quantiteRestante: number;
        dateCreation: Date;
        dateExpiration: Date;
        notesExpiration: string | null;
    }[] | {
        id: string;
        quantite: number;
        produitId: string;
        poidsTotal: number;
        productionId: string;
        poidsUnitaire: number;
    }[] | ({
        id: string;
        quantite: number;
        produitId: string;
        poidsTotal: number;
        productionId: string;
        poidsUnitaire: number;
    } | {
        id: string;
        quantite: number;
        produitId: string;
        poidsTotal: number;
        productionId: string;
        poidsUnitaire: number;
    })[];
    [x: number]: never;
    [x: symbol]: never;
}>;
export declare function getProchainNumeroPetrin(companyId: string): Promise<number>;
export declare function getProductions(companyId: string, options?: {
    categorieProd?: string;
    sessionProd?: string;
    dateDebut?: string;
    dateFin?: string;
}): Promise<({
    user: {
        nom: string;
        prenom: string;
    };
    recette: {
        nom: string;
        id: string;
        ratioPate: number;
    };
    patons: {
        id: string;
        poids: number;
        nbPieces: number;
        rendement: number;
        statutPaton: import(".prisma/client").$Enums.StatutPaton;
    }[];
    lignesProduction: ({
        produit: {
            nom: string;
        };
    } & {
        id: string;
        quantite: number;
        produitId: string;
        poidsTotal: number;
        productionId: string;
        poidsUnitaire: number;
    })[];
} & {
    date: Date;
    companyId: string;
    id: string;
    createdAt: Date;
    userId: string;
    numeroPetrin: number;
    sessionProd: string;
    nomPetrisseur: string | null;
    heureDebut: Date | null;
    heureFin: Date | null;
    quantiteFarine: number;
    pateTheorique: number;
    pateEffective: number;
    difference: number;
    ecartPct: number;
    pateRetournee: number;
    pateRecuperee: number;
    pateGatee: number;
    causeGatee: string | null;
    pateGardee: number;
    destinationPateGardee: string | null;
    categorieProd: import(".prisma/client").$Enums.CategorieProd;
    statut: import(".prisma/client").$Enums.StatutProduction;
    typeProduction: import(".prisma/client").$Enums.TypeProduction;
    nomClient: string | null;
    dateTerminaison: Date | null;
    notes: string | null;
    recetteId: string;
})[]>;
//# sourceMappingURL=production.service.d.ts.map