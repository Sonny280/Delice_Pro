import { z } from "zod";
export declare const createRecetteSchema: z.ZodObject<{
    nom: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    ratioPate: z.ZodDefault<z.ZodNumber>;
    tauxPerte: z.ZodDefault<z.ZodNumber>;
    categorie: z.ZodOptional<z.ZodString>;
    ingredients: z.ZodArray<z.ZodObject<{
        mpId: z.ZodString;
        quantite: z.ZodNumber;
        uniteId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }, {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    categorie?: string;
    nom?: string;
    description?: string;
    ratioPate?: number;
    tauxPerte?: number;
    ingredients?: {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }[];
}, {
    categorie?: string;
    nom?: string;
    description?: string;
    ratioPate?: number;
    tauxPerte?: number;
    ingredients?: {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }[];
}>;
export declare const updateRecetteSchema: z.ZodObject<{
    nom: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ratioPate: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    tauxPerte: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    categorie: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ingredients: z.ZodOptional<z.ZodArray<z.ZodObject<{
        mpId: z.ZodString;
        quantite: z.ZodNumber;
        uniteId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }, {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    categorie?: string;
    nom?: string;
    description?: string;
    ratioPate?: number;
    tauxPerte?: number;
    ingredients?: {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }[];
}, {
    categorie?: string;
    nom?: string;
    description?: string;
    ratioPate?: number;
    tauxPerte?: number;
    ingredients?: {
        quantite?: number;
        uniteId?: string;
        mpId?: string;
    }[];
}>;
export type CreateRecetteInput = z.infer<typeof createRecetteSchema>;
export declare function getRecettes(companyId: string): Promise<any[]>;
export declare function createRecette(companyId: string, data: CreateRecetteInput): Promise<any>;
export declare function updateRecette(recetteId: string, companyId: string, data: Partial<CreateRecetteInput>): Promise<any>;
export declare function dupliquerRecette(recetteId: string, companyId: string): Promise<any>;
export declare function archiverRecette(recetteId: string, companyId: string): Promise<{
    categorie: string | null;
    nom: string;
    companyId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    actif: boolean;
    description: string | null;
    ratioPate: number;
    tauxPerte: number;
    estViennoiserie: boolean;
    ingredientReference: string;
    ingredientReferenceNom: string;
    ingredientReferenceUnite: string;
}>;
//# sourceMappingURL=recettes.service.d.ts.map