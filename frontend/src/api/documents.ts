import { apiClient } from './client';
import { Document, ApprovalProcess, DocumentType } from '../types/document';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export const createDocument = async (document: Partial<Document>, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', JSON.stringify(document));
    formData.append('file', file);

    const { data } = await apiClient.post<ApiResponse<Document>>('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data.data;
};

export const searchDocuments = async (query: string, filters?: SearchFilters): Promise<Document[]> => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    
    // Добавляем фильтры в параметры запроса
    if (filters?.status?.length) {
        params.set('status', filters.status.join(','));
    }
    if (filters?.documentType?.length) {
        params.set('document_type', filters.documentType.join(','));
    }
    if (filters?.dateRange) {
        params.set('date_from', filters.dateRange[0]);
        params.set('date_to', filters.dateRange[1]);
    }

    const { data } = await apiClient.get<{ success: boolean; data: Document[] | null }>(
        `/documents/search?${params.toString()}`
    );
    return data.data || []; // Возвращаем пустой массив если data === null
};

export const startApprovalProcess = async (documentId: number, approverIds: number[]): Promise<ApprovalProcess> => {
    const { data } = await apiClient.post<ApiResponse<ApprovalProcess>>('/documents/approve/start', {
        document_id: documentId,
        approver_ids: approverIds,
    });
    return data.data;
};

export const approveDocument = async (
    processId: number,
    approved: boolean,
    comment: string
): Promise<void> => {
    await apiClient.post('/documents/approve', {
        process_id: processId,
        approved,
        comment,
    });
};

export const getDocument = async (id: number): Promise<Document> => {
    try {
        const { data } = await apiClient.get<{ success: boolean; data: Document }>(`/documents/${id}`);
        return data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Документ не найден');
        }
        throw error;
    }
};

export const updateDocument = async (id: number, document: Partial<Document>): Promise<Document> => {
    const { data } = await apiClient.put<{ success: boolean; data: Document }>(
        `/documents/${id}`, 
        document
    );
    return data.data;
};

export const getDocumentTypes = async (): Promise<DocumentType[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: DocumentType[] }>('/documents/types');
    return data.data;
}; 