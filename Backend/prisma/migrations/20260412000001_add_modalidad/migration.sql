-- Add modalidad column to User table (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'modalidad'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "modalidad" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;