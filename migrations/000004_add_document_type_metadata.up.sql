-- Добавляем новые поля
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
