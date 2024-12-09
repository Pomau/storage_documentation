import { Document } from './document';

export interface Folder {
    id: number;
    name: string;
    parent_id?: number;
    path: string;
    created_at: string;
}

export interface FolderNode extends Folder {
    children?: FolderNode[];
    files?: Document[];
}

export interface FolderAction {
    type: 'create' | 'rename' | 'delete';
    name?: string;
    parent_id?: number;
} 