-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('MEMO', 'INCOMING', 'OUTGOING', 'COMMAND', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "DocUrgency" AS ENUM ('NORMAL', 'URGENT', 'VERY_URGENT', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "DocConfidentiality" AS ENUM ('NORMAL', 'CONFIDENTIAL', 'SECRET');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoutingAction" AS ENUM ('SUBMIT', 'FORWARD', 'ENDORSE', 'RETURN_FOR_EDIT', 'APPROVE', 'REJECT');

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "doc_type" "DocType" NOT NULL DEFAULT 'MEMO',
    "urgency" "DocUrgency" NOT NULL DEFAULT 'NORMAL',
    "confidentiality" "DocConfidentiality" NOT NULL DEFAULT 'NORMAL',
    "status" "DocStatus" NOT NULL DEFAULT 'DRAFT',
    "doc_number" VARCHAR(100),
    "sequence_number" INTEGER,
    "doc_year" INTEGER NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT,
    "original_doc_number" VARCHAR(100),
    "sender_organization" VARCHAR(255),
    "attachments" JSONB,
    "submitter_id" UUID NOT NULL,
    "current_assignee_id" UUID,
    "department_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_routings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "actor_id" UUID NOT NULL,
    "target_user_id" UUID,
    "action" "RoutingAction" NOT NULL,
    "comment" TEXT,
    "signature_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_routings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_sequences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "doc_type" "DocType" NOT NULL,
    "year" INTEGER NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_tenant_id_status_doc_type_idx" ON "documents"("tenant_id", "status", "doc_type");

-- CreateIndex
CREATE INDEX "documents_tenant_id_current_assignee_id_idx" ON "documents"("tenant_id", "current_assignee_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_submitter_id_idx" ON "documents"("tenant_id", "submitter_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_doc_year_sequence_number_idx" ON "documents"("tenant_id", "doc_year", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenant_id_doc_number_key" ON "documents"("tenant_id", "doc_number");

-- CreateIndex
CREATE INDEX "document_routings_tenant_id_document_id_step_order_idx" ON "document_routings"("tenant_id", "document_id", "step_order");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequences_tenant_id_doc_type_year_key" ON "document_sequences"("tenant_id", "doc_type", "year");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_current_assignee_id_fkey" FOREIGN KEY ("current_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_routings" ADD CONSTRAINT "document_routings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_routings" ADD CONSTRAINT "document_routings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_routings" ADD CONSTRAINT "document_routings_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_routings" ADD CONSTRAINT "document_routings_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_sequences" ADD CONSTRAINT "document_sequences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
