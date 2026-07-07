/*
  Warnings:

  - The values [ENTREE] on the enum `TypeMouvement` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `dateLivraison` to the `CommandeClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `CommandeClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `CommandeFournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CommandeFournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prixUnitaire` to the `LigneCommandeClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantite` to the `LigneCommandeClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sousTotal` to the `LigneCommandeClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prixUnitaire` to the `LigneCommandeFournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantite` to the `LigneCommandeFournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sousTotal` to the `LigneCommandeFournisseur` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatutProduction" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeProduction" AS ENUM ('VENTE', 'COMMANDE');

-- CreateEnum
CREATE TYPE "StatutCommandeClient" AS ENUM ('RECUE', 'EN_PRODUCTION', 'PRETE', 'LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutCommandeFournisseur" AS ENUM ('BROUILLON', 'ENVOYEE', 'RECUE', 'ANNULEE');

-- AlterEnum
BEGIN;
CREATE TYPE "TypeMouvement_new" AS ENUM ('ENTREE_ACHAT', 'ENTREE_AJUSTEMENT', 'SORTIE_PRODUCTION', 'SORTIE_PERTE_MP', 'SORTIE_PERTE_PRODUIT', 'AJUSTEMENT');
ALTER TABLE "MouvementStock" ALTER COLUMN "type" TYPE "TypeMouvement_new" USING ("type"::text::"TypeMouvement_new");
ALTER TYPE "TypeMouvement" RENAME TO "TypeMouvement_old";
ALTER TYPE "TypeMouvement_new" RENAME TO "TypeMouvement";
DROP TYPE "TypeMouvement_old";
COMMIT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "entreprise" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "telephone" TEXT;

-- AlterTable
ALTER TABLE "CommandeClient" ADD COLUMN     "acompte" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dateLivraison" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "montantTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "statut" "StatutCommandeClient" NOT NULL DEFAULT 'RECUE';

-- AlterTable
ALTER TABLE "CommandeFournisseur" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateLivraisonPrevue" TIMESTAMP(3),
ADD COLUMN     "dateLivraisonReelle" TIMESTAMP(3),
ADD COLUMN     "montantTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "statut" "StatutCommandeFournisseur" NOT NULL DEFAULT 'BROUILLON',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LigneCommandeClient" ADD COLUMN     "prixUnitaire" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantite" INTEGER NOT NULL,
ADD COLUMN     "sousTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "LigneCommandeFournisseur" ADD COLUMN     "prixUnitaire" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantite" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantiteRecue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sousTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Production" ADD COLUMN     "dateLancement" TIMESTAMP(3),
ADD COLUMN     "dateTerminaison" TIMESTAMP(3),
ADD COLUMN     "nomClient" TEXT,
ADD COLUMN     "statut" "StatutProduction" NOT NULL DEFAULT 'EN_ATTENTE',
ADD COLUMN     "typeProduction" "TypeProduction" NOT NULL DEFAULT 'VENTE',
ALTER COLUMN "pateReelle" SET DEFAULT 0,
ALTER COLUMN "ecartKg" SET DEFAULT 0,
ALTER COLUMN "ecartPct" SET DEFAULT 0;
