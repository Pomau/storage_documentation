CREATE TABLE folder_documents (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(folder_id, document_id)
);

CREATE INDEX idx_folder_documents_folder_id ON folder_documents(folder_id);
CREATE INDEX idx_folder_documents_document_id ON folder_documents(document_id); 