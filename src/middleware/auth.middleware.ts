// ═══════════════════════════════════════════════════════════════
// src/middleware/auth.middleware.ts
// Middleware d'authentification JWT
//
// Un middleware est une fonction qui s'exécute AVANT le controller.
// Son rôle : vérifier que la requête vient d'un utilisateur connecté.
//
// Fonctionnement :
// 1. Le client envoie le token JWT dans le header Authorization
// 2. On extrait et vérifie le token
// 3. On charge l'utilisateur depuis la BDD
// 4. On stocke l'utilisateur dans req.user pour le controller
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import prisma from "../config/database";
import { Role } from "@prisma/client";

// Interface du payload stocké dans le token JWT
interface JwtPayload {
  userId: string;
  companyId: string;
  role: Role;
  email: string;
}

// ─── Middleware principal : vérifie que l'utilisateur est connecté ───
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction // next() = passe au middleware/controller suivant
): Promise<void> => {
  try {
    // 1. Récupérer le header Authorization
    // Format attendu : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // 401 = Non autorisé (pas de token)
      res.status(401).json({
        success: false,
        message: "Accès refusé : aucun token fourni",
      });
      return;
    }

    // 2. Extraire le token (enlever "Bearer " du début)
    const token = authHeader.split(" ")[1];

    // 3. Vérifier et décoder le token
    // jwt.verify lance une exception si le token est invalide ou expiré
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 4. Vérifier que l'utilisateur existe toujours en BDD et est actif
    // (il pourrait avoir été désactivé depuis la création du token)
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        companyId: decoded.companyId,
        actif: true, // Seulement les utilisateurs actifs
      },
      select: {
        id: true,
        companyId: true,
        role: true,
        email: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Token invalide : utilisateur introuvable ou inactif",
      });
      return;
    }

    // 5. Stocker les infos utilisateur dans req.user pour les controllers
    req.user = user;

    // 6. Passer au middleware/controller suivant
    next();
  } catch (error) {
    // Le token est invalide ou expiré
    res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }
};

// ─── Factory de middleware : vérifie les rôles autorisés ───
// Usage : router.get('/admin', authMiddleware, requireRole(['ADMIN']), controller)
export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // req.user est rempli par authMiddleware (appelé avant)
    if (!req.user) {
      res.status(401).json({ success: false, message: "Non authentifié" });
      return;
    }

    // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
    if (!roles.includes(req.user.role)) {
      // 403 = Interdit (connecté mais pas les droits suffisants)
      res.status(403).json({
        success: false,
        message: `Accès refusé. Rôles autorisés : ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
