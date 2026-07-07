// ═══════════════════════════════════════════════════════════════
// src/types/express.d.ts
// Extension du type Request d'Express
//
// Par défaut, Express ne connaît pas req.user ni req.companyId.
// Ce fichier "augmente" le type Request pour ajouter ces champs.
// Ainsi TypeScript sait que req.user existe après le middleware auth.
// ═══════════════════════════════════════════════════════════════

import { Role } from "@prisma/client";

// On "augmente" le module express pour ajouter nos champs personnalisés
declare global {
  namespace Express {
    interface Request {
      // Données de l'utilisateur connecté (remplies par authMiddleware)
      user?: {
        id: string;        // ID de l'utilisateur
        companyId: string; // ID de son entreprise
        role: Role;        // Son rôle (ADMIN, CAISSIER, etc.)
        email: string;
      };
    }
  }
}

export {}; // Nécessaire pour que TypeScript traite ce fichier comme un module
