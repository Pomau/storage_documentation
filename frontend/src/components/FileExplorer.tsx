import React, { useState, useEffect } from 'react';
import { Tree, Button, Modal, Input, Space, message } from 'antd';
import { 
    FolderOutlined, 
    FileOutlined, 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined 
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { getFolderTree, createFolder, renameFolder, deleteFolder, FolderNode } from '../api/folders';

interface FileExplorerProps {
    onFileSelect: (path: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedNode, setSelectedNode] = useState<DataNode | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'rename'>('create');
    const [loading, setLoading] = useState(false);

    const loadFolderTree = async () => {
        try {
            setLoading(true);
            const folders = await getFolderTree();
            const treeData = convertToTreeData(folders);
            setTreeData(treeData);
        } catch (error) {
            message.error('Ошибка загрузки структуры папок');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFolderTree();
    }, []);

    const convertToTreeData = (folders: FolderNode[]): DataNode[] => {
        return folders.map(folder => ({
            title: folder.name,
            key: folder.id.toString(),
            icon: <FolderOutlined />,
            children: [
                ...(folder.children ? convertToTreeData(folder.children) : []),
                ...(folder.files?.map(file => ({
                    title: file.name,
                    key: `file-${file.id}`,
                    icon: <FileOutlined />,
                    isLeaf: true,
                })) || [])
            ]
        }));
    };

    const handleCreateFolder = async (parentKey: string) => {
        try {
            const folder = await createFolder(newFolderName, parseInt(parentKey));
            await loadFolderTree(); // Перезагружаем дерево
            message.success(`Создана папка: ${folder.name}`);
            setIsModalVisible(false);
            setNewFolderName('');
        } catch (error) {
            message.error('Ошибка создания папки');
        }
    };

    const handleRenameFolder = async (id: number, newName: string) => {
        try {
            await renameFolder(id, newName);
            await loadFolderTree(); // Перезагружаем дерево
            message.success(`Папка переименована на: ${newName}`);
            setIsModalVisible(false);
            setNewFolderName('');
        } catch (error) {
            message.error('Ошибка переименования папки');
        }
    };

    const handleDeleteFolder = async (id: number) => {
        try {
            await deleteFolder(id);
            await loadFolderTree(); // Перезагружаем дерево
            message.success('Папка удалена');
        } catch (error) {
            message.error('Ошибка удаления папки');
        }
    };

    const handleModalOk = () => {
        if (!newFolderName.trim()) {
            message.error('Введите название папки');
            return;
        }

        if (modalMode === 'create' && selectedNode) {
            handleCreateFolder(selectedNode.key as string);
        } else if (modalMode === 'rename' && selectedNode) {
            handleRenameFolder(parseInt(selectedNode.key as string), newFolderName);
        }
    };

    return (
        <div>
            <Tree
                showLine
                defaultExpandAll
                treeData={treeData}
                titleRender={(node) => (
                    <Space>
                        <span>{node.title}</span>
                        {!node.isLeaf && (
                            <Space size="small">
                                <Button 
                                    type="text" 
                                    icon={<PlusOutlined />} 
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                        setModalMode('create');
                                        setIsModalVisible(true);
                                    }}
                                />
                                <Button 
                                    type="text" 
                                    icon={<EditOutlined />} 
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                        setNewFolderName(node.title as string);
                                        setModalMode('rename');
                                        setIsModalVisible(true);
                                    }}
                                />
                                <Button 
                                    type="text" 
                                    icon={<DeleteOutlined />} 
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(parseInt(node.key as string));
                                    }}
                                />
                            </Space>
                        )}
                    </Space>
                )}
                onSelect={(selectedKeys) => {
                    const key = selectedKeys[0] as string;
                    if (key.startsWith('file-')) {
                        onFileSelect(key.replace('file-', ''));
                    }
                }}
                loading={loading}
            />

            <Modal
                title={modalMode === 'create' ? 'Создать папку' : 'Переименовать папку'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    setNewFolderName('');
                }}
            >
                <Input
                    placeholder="Введите название папки"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
            </Modal>
        </div>
    );
}; 