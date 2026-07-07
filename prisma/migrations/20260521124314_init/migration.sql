/*
  Warnings:

  - You are about to drop the column `dateLancement` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `ecartKg` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `pateReelle` on the `Production` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutPaton" AS ENUM ('EN_CHAMBRE_FROIDE', 'FACONNE', 'PERDU');

-- CreateEnum
CREATE TYPE "CategorieProd" AS ENUM ('BOULANGERIE', 'VIENNOISERIE_PETRISSAGE', 'VIENNOISERIE_FACONNAGE', 'PATISSERIE');

-- CreateEnum
CREATE TYPE "StatutLot" AS ENUM ('ACTIF', 'EPUISE', 'EXPIRE', 'PERDU');

-- AlterEnum
ALTER TYPE "ModePaiement" ADD VALUE 'A_CREDIT';

-- AlterEnum
ALTER TYPE "StatutCommandeFournisseur" ADD VALUE 'RECUE_PARTIELLE';

-- AlterTable
ALTER TABLE "CommandeFournisseur" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "heureCloture" TEXT NOT NULL DEFAULT '17:00';

-- AlterTable
ALTER TABLE "MatierePremiere" ADD COLUMN     "stockGere" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "prixAchat" SET DEFAULT 0,
ALTER COLUMN "seuilAlerte" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Production" DROP COLUMN "dateLancement",
DROP COLUMN "ecartKg",
DROP COLUMN "pateReelle",
ADD COLUMN     "categorieProd" "CategorieProd" NOT NULL DEFAULT 'BOULANGERIE',
ADD COLUMN     "causeGatee" TEXT,
ADD COLUMN     "destinationPateGardee" TEXT,
ADD COLUMN     "difference" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "heureDebut" TIMESTAMP(3),
ADD COLUMN     "heureFin" TIMESTAMP(3),
ADD COLUMN     "nomPetrisseur" TEXT,
ADD COLUMN     "numeroPetrin" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pateEffective" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pateGardee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pateGatee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pateRecuperee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pateRetournee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sessionProd" TEXT NOT NULL DEFAULT 'NUIT';

-- AlterTable
ALTER TABLE "Produit" ADD COLUMN     "dlvJours" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "estSemiFini" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Recette" ADD COLUMN     "categorie" TEXT,
ADD COLUMN     "tauxPerte" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vente" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "montantBrut" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nomClient" TEXT,
ADD COLUMN     "remiseMontant" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "remisePct" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LigneProduction" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "poidsUnitaire" DOUBLE PRECISION NOT NULL,
    "poidsTotal" DOUBLE PRECISION NOT NULL,
    "productionId" TEXT NOT NULL,

    CONSTRAINT "LigneProduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paton" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poids" DOUBLE PRECISION NOT NULL,
    "poidsBeurre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "poidsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbPieces" INTEGER NOT NULL DEFAULT 0,
    "rendement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statutPaton" "StatutPaton" NOT NULL DEFAULT 'EN_CHAMBRE_FROIDE',
    "dateFaconnage" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,
    "produitId" TEXT,

    CONSTRAINT "Paton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotStock" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produitId" TEXT NOT NULL,
    "productionId" TEXT,
    "quantiteInitiale" INTEGER NOT NULL,
    "quantiteRestante" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "dlvJours" INTEGER NOT NULL,
    "statut" "StatutLot" NOT NULL DEFAULT 'ACTIF',
    "companyId" TEXT NOT NULL,
    "notesExpiration" TEXT,

    CONSTRAINT "LotStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloturJournee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "heureRealisation" TIMESTAMP(3) NOT NULL,
    "caTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalEspeces" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMobile" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarte" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVirement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbInvendus" INTEGER NOT NULL DEFAULT 0,
    "valeurInvendus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nbPertes" INTEGER NOT NULL DEFAULT 0,
    "valeurPertes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fondCaisse" DOUBLE PRECISION,
    "ecartFond" DOUBLE PRECISION,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CloturJournee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LotStock_companyId_statut_idx" ON "LotStock"("companyId", "statut");

-- CreateIndex
CREATE INDEX "LotStock_companyId_dateExpiration_idx" ON "LotStock"("companyId", "dateExpiration");

-- CreateIndex
CREATE INDEX "LotStock_produitId_statut_idx" ON "LotStock"("produitId", "statut");

-- CreateIndex
CREATE INDEX "CommandeClient_companyId_statut_idx" ON "CommandeClient"("companyId", "statut");

-- CreateIndex
CREATE INDEX "CommandeClient_companyId_dateLivraison_idx" ON "CommandeClient"("companyId", "dateLivraison");

-- CreateIndex
CREATE INDEX "CommandeClient_clientId_idx" ON "CommandeClient"("clientId");

-- CreateIndex
CREATE INDEX "Perte_companyId_date_idx" ON "Perte"("companyId", "date");

-- CreateIndex
CREATE INDEX "Perte_companyId_type_idx" ON "Perte"("companyId", "type");

-- CreateIndex
CREATE INDEX "Vente_companyId_date_idx" ON "Vente"("companyId", "date");

-- CreateIndex
CREATE INDEX "Vente_companyId_modePaiement_idx" ON "Vente"("companyId", "modePaiement");

-- CreateIndex
CREATE INDEX "Vente_clientId_idx" ON "Vente"("clientId");

-- AddForeignKey
ALTER TABLE "LigneProduction" ADD CONSTRAINT "LigneProduction_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneProduction" ADD CONSTRAINT "LigneProduction_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paton" ADD CONSTRAINT "Paton_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paton" ADD CONSTRAINT "Paton_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paton" ADD CONSTRAINT "Paton_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotStock" ADD CONSTRAINT "LotStock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotStock" ADD CONSTRAINT "LotStock_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotStock" ADD CONSTRAINT "LotStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloturJournee" ADD CONSTRAINT "CloturJournee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloturJournee" ADD CONSTRAINT "CloturJournee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
