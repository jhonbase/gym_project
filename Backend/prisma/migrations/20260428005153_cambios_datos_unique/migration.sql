/*
  Warnings:

  - You are about to drop the column `lesionEvidencia` on the `Assessment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numeroCarnet]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefono]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "lesionEvidencia",
ADD COLUMN     "diasDisponibles" TEXT[],
ADD COLUMN     "historialClinico" TEXT,
ADD COLUMN     "lesionesEvidencia" TEXT[],
ADD COLUMN     "planEntrenamiento" TEXT,
ALTER COLUMN "proximaFechaValoracion" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "numeroCarnet" DROP DEFAULT,
ALTER COLUMN "modalidad" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "User_numeroCarnet_key" ON "User"("numeroCarnet");

-- CreateIndex
CREATE UNIQUE INDEX "User_telefono_key" ON "User"("telefono");
