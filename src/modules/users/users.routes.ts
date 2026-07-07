// src/modules/users/users.routes.ts
// Ameliorations :
// - PUT /:id/password : reinitialiser le mot de passe
// - lastLogin : date derniere connexion
// - Protection : ADMIN seulement pour creer/modifier/desactiver

import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import prisma from "../../config/database";
import { AppError } from "../../middleware/error.middleware";

const router = Router();
router.use(authMiddleware);

const createUserSchema = z.object({
  prenom:   z.string().min(1, "Prenom requis"),
  nom:      z.string().min(1, "Nom requis"),
  email:    z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caracteres"),
  role:     z.enum(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER", "GESTIONNAIRE", "CAISSIER", "COMPTABLE"]),
});

const updateUserSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom:    z.string().min(1).optional(),
  role:   z.enum(["ADMIN", "RESPONSABLE", "CHEF_PATISSIER", "GESTIONNAIRE", "CAISSIER", "COMPTABLE"]).optional(),
  actif:  z.boolean().optional(),
});

// GET /api/users
router.get("/",
  requireRole(["ADMIN", "RESPONSABLE"]),
  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      where:   { companyId: req.user!.companyId },
      select:  {
        id: true, prenom: true, nom: true, email: true,
        role: true, actif: true, createdAt: true,
        // lastLogin si le champ existe (optionnel)
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: users });
  }
);

// POST /api/users — Creer un utilisateur (ADMIN seulement)
router.post("/",
  requireRole(["ADMIN"]),
  async (req: Request, res: Response) => {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { email: data.email, companyId: req.user!.companyId },
    });
    if (existing) throw new AppError("Cet email est deja utilise dans votre entreprise", 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        prenom: data.prenom, nom: data.nom,
        email: data.email, passwordHash,
        role: data.role, companyId: req.user!.companyId,
      },
      select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true },
    });
    res.status(201).json({ success: true, data: user });
  }
);

// PUT /api/users/:id — Modifier role/statut (ADMIN seulement)
router.put("/:id",
  requireRole(["ADMIN"]),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Empecher l'ADMIN de se desactiver lui-meme
    if (id === req.user!.id && req.body.actif === false) {
      throw new AppError("Vous ne pouvez pas desactiver votre propre compte", 400);
    }

    // Verifier que l'utilisateur appartient a la meme entreprise
    const existing = await prisma.user.findFirst({
      where: { id, companyId: req.user!.companyId },
    });
    if (!existing) throw new AppError("Utilisateur introuvable", 404);

    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where:  { id },
      data,
      select: { id: true, prenom: true, nom: true, email: true, role: true, actif: true },
    });
    res.json({ success: true, data: user });
  }
);

// PUT /api/users/:id/password — Reinitialiser le mot de passe (ADMIN seulement)
router.put("/:id/password",
  requireRole(["ADMIN"]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = z.object({
      password: z.string().min(8, "Minimum 8 caracteres"),
    }).parse(req.body);

    // Verifier appartenance a la meme entreprise
    const existing = await prisma.user.findFirst({
      where: { id, companyId: req.user!.companyId },
    });
    if (!existing) throw new AppError("Utilisateur introuvable", 404);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id },
      data:  { passwordHash },
    });
    res.json({ success: true, data: { message: "Mot de passe reinitialise avec succes" } });
  }
);

export default router;