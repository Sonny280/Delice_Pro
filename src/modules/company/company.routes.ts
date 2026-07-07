// src/modules/company/company.routes.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { authMiddleware, requireRole } from "../../middleware/auth.middleware";
import {
  getCompany,
  updateCompany,
  uploadLogo,
  getDashboardData,
  updateCompanySchema,
} from "./company.service";

const router = Router();
router.use(authMiddleware);

// Multer : stockage en mémoire, limite 500 Ko (mode base64 local)
// Si Cloudinary est configuré, la limite peut être augmentée à 2 Mo
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 }, // 500 Ko max en mode local
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont acceptées (PNG, JPG, SVG, WebP)"));
    }
  },
});

// GET /api/company
router.get("/", async (req: Request, res: Response) => {
  const company = await getCompany(req.user!.companyId);
  res.json({ success: true, data: company });
});

// PUT /api/company
router.put("/", requireRole(["ADMIN"]), async (req: Request, res: Response) => {
  const data = updateCompanySchema.parse(req.body);
  const company = await updateCompany(req.user!.companyId, data);
  res.json({ success: true, data: company });
});

// POST /api/company/logo — Upload logo (Cloudinary ou base64 local)
router.post(
  "/logo",
  requireRole(["ADMIN"]),
  // Multer gère le fichier uploadé — disponible dans req.file
  (req: Request, res: Response, next: any) => {
    upload.single("logo")(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        // Message d'erreur clair si le fichier est trop lourd
        res.status(400).json({
          success: false,
          message: "Logo trop lourd. Maximum 500 Ko. Compressez l'image sur https://squoosh.app/ avant de la télécharger.",
        });
        return;
      }
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Aucun fichier reçu" });
      return;
    }

    const logoUrl = await uploadLogo(
      req.user!.companyId,
      req.file.buffer,
      req.file.mimetype
    );
    res.json({ success: true, data: { logoUrl } });
  }
);

// GET /api/company/dashboard
router.get("/dashboard", async (req: Request, res: Response) => {
  const data = await getDashboardData(req.user!.companyId);
  res.json({ success: true, data });
});

export default router;