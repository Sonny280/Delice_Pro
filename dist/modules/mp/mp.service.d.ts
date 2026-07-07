import { z } from "zod";
export declare const createMPSchema: z.ZodObject<{
    nom: z.ZodString;
    prixAchat: z.ZodNumber;
    stockActuel: z.ZodDefault<z.ZodNumber>;
    seuilAlerte: z.ZodNumber;
    categorieId: z.ZodOptional<z.ZodString>;
    uniteId: z.ZodOptional<z.ZodString>;
    fournisseurId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nom?: string;
    prixAchat?: number;
    stockActuel?: number;
    seuilAlerte?: number;
    categorieId?: string;
    uniteId?: string;
    fournisseurId?: string;
}, {
    nom?: string;
    prixAchat?: number;
    stockActuel?: number;
    seuilAlerte?: number;
    categorieId?: string;
    uniteId?: string;
    fournisseurId?: string;
}>;
export declare const updateMPSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    prixAchat: z.ZodOptional<z.ZodNumber>;
    stockActuel: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    seuilAlerte: z.ZodOptional<z.ZodNumber>;
    categorieId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    uniteId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fournisseurId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    nom?: string;
    prixAchat?: number;
    stockActuel?: number;
    seuilAlerte?: number;
    categorieId?: string;
    uniteId?: string;
    fournisseurId?: string;
}, {
    nom?: string;
    prixAchat?: number;
    stockActuel?: number;
    seuilAlerte?: number;
    categorieId?: string;
    uniteId?: string;
    fournisseurId?: string;
}>;
export declare const entreeStockSchema: z.ZodObject<{
    mpId: z.ZodString;
    quantite: z.ZodNumber;
    motif: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quantite?: number;
    mpId?: string;
    motif?: string;
}, {
    quantite?: number;
    mpId?: string;
    motif?: string;
}>;
export type CreateMPInput = z.infer<typeof createMPSchema>;
export type UpdateMPInput = z.infer<typeof updateMPSchema>;
export type EntreeStockInput = z.infer<typeof entreeStockSchema>;
export declare function getMPList(companyId: string): Promise<{
    statut: string;
    categorie: {
        nom: string;
        id: string;
    };
    unite: {
        nom: string;
        id: string;
        abreviation: string;
    };
    fournisseur: {
        nom: string;
        id: string;
    };
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    prixAchat: number;
    stockActuel: number;
    seuilAlerte: number;
    categorieId: string | null;
    stockGere: boolean;
    uniteId: string | null;
    fournisseurId: string | null;
}[]>;
export declare function createMP(companyId: string, data: CreateMPInput): Promise<{
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    prixAchat: number;
    stockActuel: number;
    seuilAlerte: number;
    categorieId: string | null;
    stockGere: boolean;
    uniteId: string | null;
    fournisseurId: string | null;
}>;
export declare function updateMP(mpId: string, companyId: string, data: UpdateMPInput): Promise<{
    categorie: {
        type: import(".prisma/client").$Enums.TypeCategorie;
        nom: string;
        companyId: string;
        id: string;
        createdAt: Date;
        margeMin: number | null;
    };
    unite: {
        type: import(".prisma/client").$Enums.TypeUnite;
        nom: string;
        companyId: string;
        id: string;
        createdAt: Date;
        abreviation: string;
        uniteBase: string;
        coefficient: number;
    };
    fournisseur: {
        nom: string;
        adresse: string | null;
        telephone: string | null;
        email: string | null;
        companyId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        actif: boolean;
        contact: string | null;
        delaiLivraison: string | null;
        conditionsPaiement: string | null;
    };
} & {
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    prixAchat: number;
    stockActuel: number;
    seuilAlerte: number;
    categorieId: string | null;
    stockGere: boolean;
    uniteId: string | null;
    fournisseurId: string | null;
}>;
export declare function entreeStock(companyId: string, data: EntreeStockInput): Promise<{
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    prixAchat: number;
    stockActuel: number;
    seuilAlerte: number;
    categorieId: string | null;
    stockGere: boolean;
    uniteId: string | null;
    fournisseurId: string | null;
}>;
export declare function deleteMP(mpId: string, companyId: string): Promise<{
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    prixAchat: number;
    stockActuel: number;
    seuilAlerte: number;
    categorieId: string | null;
    stockGere: boolean;
    uniteId: string | null;
    fournisseurId: string | null;
}>;
export declare function getMouvementsStock(mpId: string, companyId: string): Promise<{
    type: import(".prisma/client").$Enums.TypeMouvement;
    id: string;
    createdAt: Date;
    quantite: number;
    mpId: string;
    motif: string | null;
}[]>;
//# sourceMappingURL=mp.service.d.ts.map