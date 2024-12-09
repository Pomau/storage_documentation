-- Добавляем поле для хранения содержимого файла
ALTER TABLE documents ADD COLUMN file_content text;

-- Обновляем поле search_vector с учетом содержимого файла
DROP TRIGGER IF EXISTS documents_search_vector_update ON documents;
DROP FUNCTION IF EXISTS documents_search_vector_update();

ALTER TABLE documents DROP COLUMN IF EXISTS search_vector;
ALTER TABLE documents ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('russian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(museum_name, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(founder, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(contact_person, '')), 'C') ||
    setweight(to_tsvector('russian', coalesce(incoming_number::text, '')), 'C') ||
    setweight(to_tsvector('russian', coalesce(metadata::text, '')), 'D') ||
    setweight(to_tsvector('russian', coalesce(file_content, '')), 'D')
) STORED;

-- Пересоздаем индекс для поиска
DROP INDEX IF EXISTS documents_search_idx;
CREATE INDEX documents_search_idx ON documents USING GIN (search_vector); 