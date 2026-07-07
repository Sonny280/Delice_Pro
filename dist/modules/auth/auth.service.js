"use strict";
// ═══════════════════════════════════════════════════════════════
// src/modules/auth/auth.service.ts
// Logique métier de l'authentification
//
// Le service contient TOUTE la logique. Le controller est léger
// (il appelle le service et renvoie la réponse).
// ═══════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerCompanySchema = void 0;
exports.registerCompany = registerCompany;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const error_middleware_1 = require("../../middleware/error.middleware");
// ─── Schémas de validation Zod ───────────────────────────────
// Ces schémas définissent la forme attendue des données.
// Si les données ne correspondent pas, une erreur est lancée.
exports.registerCompanySchema = zod_1.z.object({
    // Données de l'entreprise
    company: zod_1.z.object({
        nom: zod_1.z.string().min(2, "Le nom doit faire au moins 2 caractères"),
        type: zod_1.z.string().default("Pâtisserie"),
        adresse: zod_1.z.string().optional(),
        ville: zod_1.z.string().optional(),
        pays: zod_1.z.string().optional(),
        telephone: zod_1.z.string().optional(),
        email: zod_1.z.string().email("Email invalide").optional(),
        siteWeb: zod_1.z.string().optional(),
        devise: zod_1.z.string().default("F"),
        couleurPrincipale: zod_1.z.string().default("#1a2744"),
    }),
    // Données de l'administrateur
    admin: zod_1.z.object({
        prenom: zod_1.z.string().min(1, "Le prénom est requis"),
        nom: zod_1.z.string().min(1, "Le nom est requis"),
        email: zod_1.z.string().email("Email invalide"),
        password: zod_1.z
            .string()
            .min(8, "Le mot de passe doit faire au moins 8 caractères"),
    }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(1, "Le mot de passe est requis"),
    companyId: zod_1.z.string().min(1, "L'identifiant entreprise est requis"),
});
// ─── Service : Inscription (création entreprise + admin) ────────
async function registerCompany(data) {
    // 1. Vérifier que l'email admin n'est pas déjà utilisé globalement
    const existingUser = await database_1.default.user.findFirst({
        where: { email: data.admin.email },
    });
    if (existingUser) {
        throw new error_middleware_1.AppError("Cet email est déjà utilisé", 409);
    }
    // 2. Hacher le mot de passe AVANT de le stocker
    // bcrypt.hash(motDePasse, saltRounds) — 12 rounds = bon équilibre sécurité/perf
    const passwordHash = await bcryptjs_1.default.hash(data.admin.password, 12);
    // 3. Créer l'entreprise ET l'administrateur en une seule transaction
    // Si la création de l'entreprise réussit mais celle de l'admin échoue,
    // Prisma annule tout automatiquement (rollback)
    const result = await database_1.default.$transaction(async (tx) => {
        // Créer l'entreprise
        const company = await tx.company.create({
            data: {
                nom: data.company.nom,
                type: data.company.type,
                adresse: data.company.adresse,
                ville: data.company.ville,
                pays: data.company.pays,
                telephone: data.company.telephone,
                email: data.company.email,
                siteWeb: data.company.siteWeb,
                devise: data.company.devise,
                couleurPrincipale: data.company.couleurPrincipale,
            },
        });
        // Créer l'administrateur lié à cette entreprise
        const admin = await tx.user.create({
            data: {
                prenom: data.admin.prenom,
                nom: data.admin.nom,
                email: data.admin.email,
                passwordHash,
                role: "ADMIN", // Le premier utilisateur est toujours admin
                companyId: company.id,
            },
        });
        return { company, admin };
    });
    // 4. Générer le token JWT
    const token = generateToken(result.admin.id, result.company.id, "ADMIN", result.admin.email);
    // 5. Retourner les données sans le mot de passe haché
    return {
        token,
        company: {
            id: result.company.id,
            nom: result.company.nom,
            couleurPrincipale: result.company.couleurPrincipale,
            devise: result.company.devise,
        },
        user: {
            id: result.admin.id,
            prenom: result.admin.prenom,
            nom: result.admin.nom,
            email: result.admin.email,
            role: result.admin.role,
        },
    };
}
// ─── Service : Connexion ────────────────────────────────────────
async function login(data) {
    // 1. Trouver l'utilisateur par email ET companyId
    // (un même email peut exister dans deux entreprises différentes)
    const user = await database_1.default.user.findFirst({
        where: {
            email: data.email,
            companyId: data.companyId,
            actif: true, // Seulement les utilisateurs actifs
        },
        include: {
            company: {
                select: {
                    id: true,
                    nom: true,
                    couleurPrincipale: true,
                    devise: true,
                    // logoUrl intentionnellement exclu — chargé séparément via /api/company
                    // Le logo base64 peut peser plusieurs centaines de Ko et ralentit le login
                },
            },
        },
    });
    if (!user) {
        // Message volontairement vague pour ne pas indiquer si c'est l'email ou le mot de passe
        throw new error_middleware_1.AppError("Email ou mot de passe incorrect", 401);
    }
    // 2. Comparer le mot de passe avec le hash stocké
    // bcrypt.compare() est sécurisé contre les attaques timing
    const passwordValid = await bcryptjs_1.default.compare(data.password, user.passwordHash);
    if (!passwordValid) {
        throw new error_middleware_1.AppError("Email ou mot de passe incorrect", 401);
    }
    // 3. Générer le token JWT
    const token = generateToken(user.id, user.companyId, user.role, user.email);
    return {
        token,
        company: user.company,
        user: {
            id: user.id,
            prenom: user.prenom,
            nom: user.nom,
            email: user.email,
            role: user.role,
        },
    };
}
// ─── Fonction utilitaire : Générer un token JWT ─────────────────
function generateToken(userId, companyId, role, email) {
    // jwt.sign(payload, secret, options)
    // Le payload est stocké DANS le token (visible si décodé, mais signé)
    return jsonwebtoken_1.default.sign({ userId, companyId, role, email }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
}
//# sourceMappingURL=auth.service.js.map