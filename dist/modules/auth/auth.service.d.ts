import { z } from "zod";
export declare const registerCompanySchema: z.ZodObject<{
    company: z.ZodObject<{
        nom: z.ZodString;
        type: z.ZodDefault<z.ZodString>;
        adresse: z.ZodOptional<z.ZodString>;
        ville: z.ZodOptional<z.ZodString>;
        pays: z.ZodOptional<z.ZodString>;
        telephone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        siteWeb: z.ZodOptional<z.ZodString>;
        devise: z.ZodDefault<z.ZodString>;
        couleurPrincipale: z.ZodDefault<z.ZodString>;
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
    admin: z.ZodObject<{
        prenom: z.ZodString;
        nom: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        nom?: string;
        email?: string;
        prenom?: string;
        password?: string;
    }, {
        nom?: string;
        email?: string;
        prenom?: string;
        password?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    company?: {
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
    };
    admin?: {
        nom?: string;
        email?: string;
        prenom?: string;
        password?: string;
    };
}, {
    company?: {
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
    };
    admin?: {
        nom?: string;
        email?: string;
        prenom?: string;
        password?: string;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    companyId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
    companyId?: string;
}, {
    email?: string;
    password?: string;
    companyId?: string;
}>;
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare function registerCompany(data: RegisterCompanyInput): Promise<{
    token: string;
    company: {
        id: string;
        nom: string;
        couleurPrincipale: string;
        devise: string;
    };
    user: {
        id: string;
        prenom: string;
        nom: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    };
}>;
export declare function login(data: LoginInput): Promise<{
    token: string;
    company: {
        nom: string;
        devise: string;
        couleurPrincipale: string;
        id: string;
    };
    user: {
        id: string;
        prenom: string;
        nom: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map