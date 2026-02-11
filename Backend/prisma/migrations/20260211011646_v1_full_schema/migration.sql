-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "eps" TEXT NOT NULL,
    "grupoSanguineo" TEXT NOT NULL,
    "contactoEmergencia" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "jornada" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "peso" REAL NOT NULL,
    "estatura" REAL NOT NULL,
    "grasaCorporal" REAL NOT NULL,
    "masaMuscular" REAL NOT NULL,
    "imc" REAL NOT NULL,
    "masaMagra" REAL NOT NULL,
    "aguaCorporal" REAL NOT NULL,
    "grasaVisceral" INTEGER NOT NULL,
    "presionArterial" TEXT NOT NULL,
    "edadMetabolica" INTEGER NOT NULL,
    "fuerzaAgarre" REAL NOT NULL,
    "resistenciaMuscular" TEXT NOT NULL,
    "rmEstimado" REAL NOT NULL,
    "ppm" INTEGER NOT NULL,
    "nivelActividadFisica" TEXT NOT NULL,
    "observacion" TEXT,
    "objetivoUsuario" TEXT NOT NULL,
    "analisisIA" TEXT,
    "estadoValoracion" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_documento_key" ON "User"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Fingerprint_userId_idx" ON "Fingerprint"("userId");

-- CreateIndex
CREATE INDEX "Assessment_userId_idx" ON "Assessment"("userId");
