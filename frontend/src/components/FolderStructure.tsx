import React, { useState } from 'react';
import { Tree, Button, Dropdown, Menu, Space, message, Modal, Input } from 'antd';
import { 
    FolderOutlined, 
    FolderOpenOutlined,
    FileOutlined, 
    MoreOutlined,
    FileWordOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FileImageOutlined,
    UploadOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { FolderNode } from '../types/folder';
import { createFolder, renameFolder, deleteFolder } from '../api/folders';
import { FileUpload } from './FileUpload';
import type { DataNode } from 'antd/es/tree';
import '../styles/components/FolderStructure.css';

interface FolderStructureProps {
    folders: FolderNode[];
    onSelect: (selectedKeys: string[]) => void;
    onFolderUpdate: () => void;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({ 
    folders, 
    onSelect,
    onFolderUpdate 
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'rename' | 'upload'>('create');
    const [selectedNode, setSelectedNode] = useState<{ id: number; name?: string }>();
    const [newName, setNewName] = useState('');

    const handleModalOk = async () => {
        if (!selectedNode) return;

        try {
            if (modalMode === 'create') {
                await createFolder(newName, selectedNode.id);
                message.success('Папка создана');
            } else if (modalMode === 'rename') {
                await renameFolder(selectedNode.id, newName);
                message.success('Папка переименована');
            }
            setModalVisible(false);
            setNewName('');
            onFolderUpdate();
        } catch (error) {
            message.error('Ошибка при работе с папкой');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteFolder(id);
            message.success('Папка удалена');
            onFolderUpdate();
        } catch (error) {
            message.error('Ошибка при удалении папки');
        }
    };

    const getContextMenu = (node: DataNode) => (
        <Menu>
            <Menu.Item 
                key="upload"
                icon={<UploadOutlined />}
                onClick={() => {
                    setModalMode('upload');
                    setSelectedNode({ id: parseInt(node.key.toString().split('-')[1]) });
                    setModalVisible(true);
                }}
            >
                Загрузить файл
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
                key="create" 
                icon={<PlusOutlined />}
                onClick={() => {
                    setModalMode('create');
                    setSelectedNode({ id: parseInt(node.key.toString().split('-')[1]) });
                    setNewName('');
                    setModalVisible(true);
                }}
            >
                Создать папку
            </Menu.Item>
            <Menu.Item 
                key="rename"
                icon={<EditOutlined />}
                onClick={() => {
                    setModalMode('rename');
                    setSelectedNode({ 
                        id: parseInt(node.key.toString().split('-')[1]),
                        name: node.title as string 
                    });
                    setNewName(node.title as string);
                    setModalVisible(true);
                }}
            >
                Переименовать
            </Menu.Item>
            <Menu.Item 
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(parseInt(node.key.toString().split('-')[1]))}
            >
                Удалить
            </Menu.Item>
        </Menu>
    );

    // Функция для определения иконки файла по расширению
    const getFileIcon = (fileName: string) => {
        const extension = fileName.toLowerCase().split('.').pop();
        switch (extension) {
            case 'doc':
            case 'docx':
                return <FileWordOutlined />;
            case 'pdf':
                return <FilePdfOutlined />;
            case 'xls':
            case 'xlsx':
                return <FileExcelOutlined />;
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <FileImageOutlined />;
            default:
                return <FileOutlined />;
        }
    };

    const convertToTreeData = (nodes: FolderNode[]): DataNode[] => {
        return nodes.map(node => ({
            key: `folder-${node.id}`,
            title: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{node.name}</span>
                    <Dropdown overlay={getContextMenu({ key: `folder-${node.id}`, title: node.name })} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} onClick={e => e.stopPropagation()} />
                    </Dropdown>
                </div>
            ),
            icon: ({ expanded }: { expanded: boolean }) => 
                expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
            children: [
                ...(node.children ? convertToTreeData(node.children) : []),
                ...(node.files?.map(file => ({
                    key: `file-${file.id}`,
                    title: file.title,
                    icon: getFileIcon(file.file_path || ''),
                    isLeaf: true,
                })) || [])
            ]
        }));
    };

    const renderModalContent = () => {
        switch (modalMode) {
            case 'upload':
                return selectedNode && (
                    <FileUpload 
                        folderId={selectedNode.id} 
                        onSuccess={() => {
                            setModalVisible(false);
                            onFolderUpdate();
                        }}
                    />
                );
            case 'create':
            case 'rename':
                return (
                    <Input
                        placeholder="Введите название папки"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                );
        }
    };

    // Получаем ID корневой папки
    const getRootFolderId = () => {
        return folders.length > 0 ? folders[0].id : 1; // 1 - ID корневой папки по умолчанию
    };

    // Обновляем обработчик клика по кнопке загрузки
    const handleUploadClick = () => {
        setModalMode('upload');
        setSelectedNode({ id: getRootFolderId() });
        setModalVisible(true);
    };

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button 
                        type="primary" 
                        icon={<UploadOutlined />}
                        onClick={handleUploadClick}
                    >
                        Загрузить файл
                    </Button>
                    <Button 
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setModalMode('create');
                            setSelectedNode({ id: getRootFolderId() });
                            setNewName('');
                            setModalVisible(true);
                        }}
                    >
                        Создать папку
                    </Button>
                </Space>
            </div>

            <Tree
                showLine={{ showLeafIcon: false }}
                showIcon
                defaultExpandAll
                treeData={convertToTreeData(folders)}
                onSelect={onSelect}
                className="custom-tree"
                style={{ fontSize: '14px' }}
            />

            <Modal
                title={
                    modalMode === 'create' ? 'Создать папку' : 
                    modalMode === 'rename' ? 'Переименовать папку' :
                    'Загрузить файл'
                }
                open={modalVisible}
                onOk={modalMode !== 'upload' ? handleModalOk : undefined}
                onCancel={() => {
                    setModalVisible(false);
                    setNewName('');
                }}
                footer={modalMode === 'upload' ? null : undefined}
            >
                {renderModalContent()}
            </Modal>
        </>
    );
}; 