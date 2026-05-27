-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "aiStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "disponibilidad" TEXT NOT NULL DEFAULT 'NO_DISPONIBLE';
