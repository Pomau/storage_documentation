-- Удаляем индексы
DROP INDEX IF EXISTS documents_search_idx;
DROP INDEX IF EXISTS documents_trgm_idx;

-- Удаляем функции
DROP FUNCTION IF EXISTS prepare_search_query(text);

-- Удаляем поле для полнотекстового поиска
ALTER TABLE documents DROP COLUMN IF EXISTS search_vector;

-- Удаляем расширение
DROP EXTENSION IF EXISTS pg_trgm; 