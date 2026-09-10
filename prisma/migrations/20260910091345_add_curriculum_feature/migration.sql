-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORATE');

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID,
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_th" VARCHAR(255) NOT NULL,
    "degree_en" VARCHAR(255) NOT NULL,
    "degree_short_th" VARCHAR(100) NOT NULL,
    "degree_short_en" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "curriculum_year" INTEGER NOT NULL,
    "total_credits" INTEGER NOT NULL DEFAULT 120,
    "study_duration" VARCHAR(100) NOT NULL DEFAULT '4 ปี',
    "tuition_fee" VARCHAR(255),
    "description_th" TEXT,
    "description_en" TEXT,
    "philosophy_th" TEXT,
    "philosophy_en" TEXT,
    "career_paths" JSONB,
    "plos" JSONB,
    "study_plan" JSONB,
    "course_structure" JSONB,
    "pdf_url" VARCHAR(500),
    "image_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programs_tenant_id_degree_level_is_active_idx" ON "programs"("tenant_id", "degree_level", "is_active");

-- CreateIndex
CREATE INDEX "programs_tenant_id_department_id_idx" ON "programs"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "programs_tenant_id_slug_key" ON "programs"("tenant_id", "slug");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
