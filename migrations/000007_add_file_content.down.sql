-- Удаляем индекс
DROP INDEX IF EXISTS documents_search_idx;

-- Удаляем поле search_vector
ALTER TABLE documents DROP COLUMN IF EXISTS search_vector;

-- Удаляем поле file_content
ALTER TABLE documents DROP COLUMN IF EXISTS file_content; 