CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    receipt_date TIMESTAMP NOT NULL,
    deadline_date TIMESTAMP NOT NULL,
    completion_date TIMESTAMP,
    incoming_number VARCHAR(50) NOT NULL,
    contact_person VARCHAR(100),
    kopuk INTEGER NOT NULL,
    museum_name VARCHAR(255) NOT NULL,
    founder VARCHAR(255) NOT NULL,
    founder_inn VARCHAR(12) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Черновик',
    file_path TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    folder_id INTEGER REFERENCES folders(id),
    document_type VARCHAR(50) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE approval_processes (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approvers (
    id SERIAL PRIMARY KEY,
    process_id INTEGER REFERENCES approval_processes(id),
    user_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    comment TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 