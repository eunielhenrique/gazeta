-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('received', 'classified', 'published', 'review', 'discarded', 'error');

-- CreateEnum
CREATE TYPE "ClassificationMethod" AS ENUM ('rules', 'rules_llm');

-- CreateTable
CREATE TABLE "ingest_email" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "from_addr" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_text" TEXT NOT NULL,
    "body_html" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "raw_headers" JSONB NOT NULL DEFAULT '{}',
    "status" "EmailStatus" NOT NULL DEFAULT 'received',
    "error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingest_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification" (
    "id" TEXT NOT NULL,
    "email_id" TEXT NOT NULL,
    "editoria_slug" TEXT NOT NULL,
    "regiao_slug" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "scores" JSONB NOT NULL,
    "matched_terms" JSONB NOT NULL,
    "taxonomia_versao" TEXT NOT NULL,
    "method" "ClassificationMethod" NOT NULL DEFAULT 'rules',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "editoria_slug" TEXT NOT NULL,
    "regiao_slug" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Redação Gazeta',
    "source" TEXT NOT NULL DEFAULT 'SECOM · Prefeitura de Santana de Parnaíba',
    "read_time_min" INTEGER NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "email_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingest_email_message_id_key" ON "ingest_email"("message_id");

-- CreateIndex
CREATE INDEX "ingest_email_status_received_at_idx" ON "ingest_email"("status", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "classification_email_id_key" ON "classification"("email_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_slug_key" ON "post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_email_id_key" ON "post"("email_id");

-- CreateIndex
CREATE INDEX "post_status_published_at_idx" ON "post"("status", "published_at");

-- CreateIndex
CREATE INDEX "post_editoria_slug_status_idx" ON "post"("editoria_slug", "status");

-- CreateIndex
CREATE INDEX "post_regiao_slug_status_idx" ON "post"("regiao_slug", "status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriber_email_key" ON "newsletter_subscriber"("email");

-- AddForeignKey
ALTER TABLE "classification" ADD CONSTRAINT "classification_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "ingest_email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "ingest_email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

