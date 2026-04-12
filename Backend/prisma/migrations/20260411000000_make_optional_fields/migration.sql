-- Make masaMagra and aguaCorporal optional
ALTER TABLE "Assessment" ALTER COLUMN "masaMagra" DROP NOT NULL;
ALTER TABLE "Assessment" ALTER COLUMN "aguaCorporal" DROP NOT NULL;