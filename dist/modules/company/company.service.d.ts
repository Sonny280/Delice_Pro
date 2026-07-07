import { z } from "zod";
export declare const updateCompanySchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    adresse: z.ZodOptional<z.ZodString>;
    ville: z.ZodOptional<z.ZodString>;
    pays: z.ZodOptional<z.ZodString>;
    telephone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    siteWeb: z.ZodOptional<z.ZodString>;
    devise: z.ZodOptional<z.ZodString>;
    couleurPrincipale: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: string;
    nom?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    telephone?: string;
    email?: string;
    siteWeb?: string;
    devise?: string;
    couleurPrincipale?: string;
}, {
    type?: string;
    nom?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    telephone?: string;
    email?: string;
    siteWeb?: string;
    devise?: string;
    couleurPrincipale?: string;
}>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export declare function getCompany(companyId: string): Promise<{
    type: string;
    nom: string;
    adresse: string;
    ville: string;
    pays: string;
    telephone: string;
    email: string;
    siteWeb: string;
    devise: string;
    couleurPrincipale: string;
    id: string;
    createdAt: Date;
    logoUrl: string;
}>;
export declare function updateCompany(companyId: string, data: UpdateCompanyInput): Promise<{
    type: string;
    nom: string;
    adresse: string | null;
    ville: string | null;
    pays: string | null;
    telephone: string | null;
    email: string | null;
    siteWeb: string | null;
    devise: string;
    couleurPrincipale: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    logoUrl: string | null;
    heureCloture: string;
    objectifCA: number;
    seuilPertes: number;
    chargesFixesMensuelles: number;
}>;
export declare function uploadLogo(companyId: string, fileBuffer: Buffer, mimetype: string): Promise<string>;
export declare function getDashboardData(companyId: string): Promise<{
    caAujourdhui: number;
    nbTransactionsAujourdhui: number;
    pertesAujourdhui: number;
    productionsAujourdhui: {
        recette: {
            nom: string;
        };
        id: string;
        quantiteFarine: number;
        pateTheorique: number;
        pateEffective: number;
        ecartPct: number;
    }[];
    alertesStock: {
        id: string;
        nom: string;
        stockActuel: number;
        seuilAlerte: number;
    }[];
    dernieresVentes: {
        date: Date;
        user: {
            nom: string;
            prenom: string;
        };
        id: string;
        montantTotal: number;
        modePaiement: import(".prisma/client").$Enums.ModePaiement;
        lignes: {
            produit: {
                nom: string;
            };
            quantite: number;
            sousTotal: number;
        }[];
    }[];
    topProduits: {
        produitId: any;
        nom: string;
        quantite: any;
        ca: number;
    }[];
    objectifCA: any;
    seuilPertes: any;
}>;
//# sourceMappingURL=company.service.d.ts.map