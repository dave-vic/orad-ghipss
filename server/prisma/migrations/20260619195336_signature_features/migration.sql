-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'denied');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Action" ADD VALUE 'acknowledge';
ALTER TYPE "Action" ADD VALUE 'access_request';
ALTER TYPE "Action" ADD VALUE 'access_approve';
ALTER TYPE "Action" ADD VALUE 'access_deny';
ALTER TYPE "Action" ADD VALUE 'guest_link_create';
ALTER TYPE "Action" ADD VALUE 'guest_link_view';
ALTER TYPE "Action" ADD VALUE 'two_factor_enabled';
ALTER TYPE "Action" ADD VALUE 'two_factor_disabled';
ALTER TYPE "Action" ADD VALUE 'folder_access_grant';
ALTER TYPE "Action" ADD VALUE 'folder_access_revoke';

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "requiresAck" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "announcement" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "document_acknowledgements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_acknowledgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3),
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_folder_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "grantedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_folder_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_acknowledgements_userId_documentId_key" ON "document_acknowledgements"("userId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "access_requests_userId_folderId_key" ON "access_requests"("userId", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "guest_links_token_key" ON "guest_links"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_folder_access_userId_folderId_key" ON "user_folder_access"("userId", "folderId");

-- AddForeignKey
ALTER TABLE "document_acknowledgements" ADD CONSTRAINT "document_acknowledgements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acknowledgements" ADD CONSTRAINT "document_acknowledgements_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_links" ADD CONSTRAINT "guest_links_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_links" ADD CONSTRAINT "guest_links_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_folder_access" ADD CONSTRAINT "user_folder_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_folder_access" ADD CONSTRAINT "user_folder_access_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_folder_access" ADD CONSTRAINT "user_folder_access_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
