-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "eps" TEXT NOT NULL,
    "grupoSanguineo" TEXT NOT NULL,
    "contactoEmergencia" TEXT NOT NULL,
    "programa" TEXT NOT NULL,
    "jornada" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "estatura" DOUBLE PRECISION NOT NULL,
    "grasaCorporal" DOUBLE PRECISION NOT NULL,
    "masaMuscular" DOUBLE PRECISION NOT NULL,
    "imc" DOUBLE PRECISION NOT NULL,
    "masaMagra" DOUBLE PRECISION NOT NULL,
    "aguaCorporal" DOUBLE PRECISION NOT NULL,
    "grasaVisceral" INTEGER NOT NULL,
    "presionArterial" TEXT NOT NULL,
    "edadMetabolica" INTEGER NOT NULL,
    "fuerzaAgarre" DOUBLE PRECISION NOT NULL,
    "resistenciaMuscular" TEXT NOT NULL,
    "rmEstimado" DOUBLE PRECISION NOT NULL,
    "ppm" INTEGER NOT NULL,
    "nivelActividadFisica" TEXT NOT NULL,
    "observacion" TEXT,
    "objetivoUsuario" TEXT NOT NULL,
    "analisisIA" TEXT,
    "estadoValoracion" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_documento_key" ON "User"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Fingerprint_userId_idx" ON "Fingerprint"("userId");

-- CreateIndex
CREATE INDEX "Assessment_userId_idx" ON "Assessment"("userId");

-- AddForeignKey
ALTER TABLE "Fingerprint" ADD CONSTRAINT "Fingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
