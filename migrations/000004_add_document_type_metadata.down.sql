-- Удаляем новые поля
ALTER TABLE documents
    DROP COLUMN IF EXISTS document_type,
    DROP COLUMN IF EXISTS metadata; 