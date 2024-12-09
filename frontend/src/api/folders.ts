import { apiClient } from './client';
import { FolderNode, Folder } from '../types/folder';

export const getFolderTree = async (): Promise<FolderNode[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: FolderNode[] }>('/folders/tree');
    return data.data;
};

export const createFolder = async (name: string, parentId?: number): Promise<Folder> => {
    const { data } = await apiClient.post<{ success: boolean; data: Folder }>('/folders', {
        name,
        parent_id: parentId
    });
    return data.data;
};

export const renameFolder = async (id: number, name: string): Promise<void> => {
    await apiClient.put(`/folders/${id}`, { name });
};

export const deleteFolder = async (id: number): Promise<void> => {
    await apiClient.delete(`/folders/${id}`);
};

export const uploadFile = async (folderId: number, file: File, metadata: any): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    await apiClient.post(`/folders/${folderId}/files`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadFile = async (fileId: number): Promise<Blob> => {
    const response = await apiClient.get(`/files/${fileId}/download`, {
        responseType: 'blob'
    });
    return response.data;
}; 