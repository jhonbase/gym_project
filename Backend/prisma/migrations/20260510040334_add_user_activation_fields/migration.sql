-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cuentaActivada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenActivacion" TEXT,
ADD COLUMN     "tokenActivacionExpira" TIMESTAMP(3);
