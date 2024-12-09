export interface Document {
    id: number;
    title: string;
    receipt_date: string;
    deadline_date?: string;
    completion_date?: string;
    incoming_number: string;
    contact_person: string;
    kopuk: string;
    museum_name: string;
    founder: string;
    founder_inn: string;
    status: string;
    file_path: string;
    created_at: string;
    document_type: string;
    metadata: Record<string, any>;
    file_content?: string;
}

export interface DocumentType {
    id: string;
    name: string;
    description: string;
    fields: FieldConfig[];
}

export interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    required: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
    options?: Option[];
}

export interface Option {
    value: string;
    label: string;
}

interface DocumentMetadata {
    title: string;
    receipt_date: string;
    deadline_date: string;
    incoming_number: string;
    contact_person: string;
    kopuk: string;
    museum_name: string;
    founder: string;
    founder_inn: string;
    document_type: string;
    metadata: Record<string, any>;
}

export interface ApprovalProcess {
    id: number;
    document: Document;
    status: string;
    approvers: Approver[];
    created_at: string;
}

export interface Approver {
    id: number;
    user: User;
    status: string;
    comment?: string;
    approved_at?: string;
} 