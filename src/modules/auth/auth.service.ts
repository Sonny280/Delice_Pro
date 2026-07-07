// ═══════════════════════════════════════════════════════════════
// src/modules/auth/auth.service.ts
// Logique métier de l'authentification
//
// Le service contient TOUTE la logique. Le controller est léger
// (il appelle le service et renvoie la réponse).
// ═══════════════════════════════════════════════════════════════

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";

// ─── Schémas de validation Zod ───────────────────────────────
// Ces schémas définissent la forme attendue des données.
// Si les données ne correspondent pas, une erreur est lancée.

export const registerCompanySchema = z.object({
  // Données de l'entreprise
  company: z.object({
    nom: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    type: z.string().default("Pâtisserie"),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    pays: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().email("Email invalide").optional(),
    siteWeb: z.string().optional(),
    devise: z.string().default("F"),
    couleurPrincipale: z.string().default("#1a2744"),
  }),
  // Données de l'administrateur
  admin: z.object({
    prenom: z.string().min(1, "Le prénom est requis"),
    nom: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit faire au moins 8 caractères"),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  companyId: z.string().min(1, "L'identifiant entreprise est requis"),
});

// Type TypeScript déduit automatiquement depuis le schéma Zod
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ─── Service : Inscription (création entreprise + admin) ────────
export async function registerCompany(data: RegisterCompanyInput) {
  // 1. Vérifier que l'email admin n'est pas déjà utilisé globalement
  const existingUser = await prisma.user.findFirst({
    where: { email: data.admin.email },
  });

  if (existingUser) {
    throw new AppError("Cet email est déjà utilisé", 409);
  }

  // 2. Hacher le mot de passe AVANT de le stocker
  // bcrypt.hash(motDePasse, saltRounds) — 12 rounds = bon équilibre sécurité/perf
  const passwordHash = await bcrypt.hash(data.admin.password, 12);

  // 3. Créer l'entreprise ET l'administrateur en une seule transaction
  // Si la création de l'entreprise réussit mais celle de l'admin échoue,
  // Prisma annule tout automatiquement (rollback)
  const result = await prisma.$transaction(async (tx) => {
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
export async function login(data: LoginInput) {
  // 1. Trouver l'utilisateur par email ET companyId
  // (un même email peut exister dans deux entreprises différentes)
  const user = await prisma.user.findFirst({
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
    throw new AppError("Email ou mot de passe incorrect", 401);
  }

  // 2. Comparer le mot de passe avec le hash stocké
  // bcrypt.compare() est sécurisé contre les attaques timing
  const passwordValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordValid) {
    throw new AppError("Email ou mot de passe incorrect", 401);
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
function generateToken(
  userId: string,
  companyId: string,
  role: string,
  email: string
): string {
  // jwt.sign(payload, secret, options)
  // Le payload est stocké DANS le token (visible si décodé, mais signé)
  return jwt.sign(
    { userId, companyId, role, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
}