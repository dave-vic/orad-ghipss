-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Action" ADD VALUE 'password_reset';
ALTER TYPE "Action" ADD VALUE 'folder_create';
ALTER TYPE "Action" ADD VALUE 'folder_edit';
ALTER TYPE "Action" ADD VALUE 'folder_delete';
ALTER TYPE "Action" ADD VALUE 'bulk_delete';
