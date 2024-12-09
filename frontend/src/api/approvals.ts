import { api } from './api';
import { ApprovalProcess } from '../types/document';

export const getApprovals = async () => {
    try {
        const response = await api.get<{ success: boolean; data: ApprovalProcess[] }>('/api/approvals');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching approvals:', error);
        return [];
    }
};

export const getApprovalDetails = async (processId: number): Promise<ApprovalProcess> => {
    const { data } = await api.get<ApprovalProcess>(`/approvals/${processId}`);
    return data;
};

export const startApprovalProcess = (documentId: number, approverIds: number[]) =>
    api.post(`/documents/${documentId}/approve`, { approverIds });

export const approveDocument = (processId: number, approved: boolean, comment: string) =>
    api.post(`/approvals/${processId}/approve`, { approved, comment }); 