-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN "numeroCarnet" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "esEgresado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "certificadoEps" TEXT;
ALTER TABLE "User" ADD COLUMN "modalidad" TEXT NOT NULL DEFAULT '';

-- Add missing columns to Assessment table
ALTER TABLE "Assessment" ADD COLUMN "lesionEvidencia" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "lesionDescripcion" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "anteOsteomuscular" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assessment" ADD COLUMN "anteOsteomuscularDesc" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "anteCardiovascular" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assessment" ADD COLUMN "anteCardiovascularDesc" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "anteRespiratorio" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assessment" ADD COLUMN "anteRespiratorioDesc" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "anteMetabolico" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assessment" ADD COLUMN "anteMetabolicoDesc" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "antePsiquiatrico" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assessment" ADD COLUMN "antePsiquiatricoDesc" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "antePsicologico" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Assessment" ADD COLUMN "antePsicologicoDesc" TEXT;