import React from 'react';
import { Tree, Button, Dropdown, Menu } from 'antd';
import { FolderOutlined, FileOutlined, MoreOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

interface FolderTreeProps {
    onFileSelect: (path: string) => void;
    onCreateFolder: (path: string) => void;
    onRenameFolder: (oldPath: string, newPath: string) => void;
    onDeleteFolder: (path: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
    onFileSelect,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder
}) => {
    const treeData: DataNode[] = [
        {
            title: 'Документы',
            key: '0',
            icon: <FolderOutlined />,
            children: [
                {
                    title: '2024',
                    key: '1',
                    icon: <FolderOutlined />,
                    children: [
                        {
                            title: 'Январь',
                            key: '2',
                            icon: <FolderOutlined />,
                            children: [
                                {
                                    title: 'document.pdf',
                                    key: '3',
                                    icon: <FileOutlined />,
                                    isLeaf: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    const getContextMenu = (node: DataNode) => (
        <Menu>
            {!node.isLeaf && (
                <>
                    <Menu.Item key="create" onClick={() => onCreateFolder(node.key as string)}>
                        Создать папку
                    </Menu.Item>
                    <Menu.Item key="rename" onClick={() => onRenameFolder(node.key as string, '')}>
                        Переименовать
                    </Menu.Item>
                    <Menu.Item key="delete" onClick={() => onDeleteFolder(node.key as string)}>
                        Удалить
                    </Menu.Item>
                </>
            )}
        </Menu>
    );

    return (
        <Tree
            showLine
            defaultExpandAll
            treeData={treeData}
            onSelect={(selectedKeys) => {
                const key = selectedKeys[0] as string;
                onFileSelect(key);
            }}
            titleRender={(node) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{node.title}</span>
                    {!node.isLeaf && (
                        <Dropdown overlay={getContextMenu(node)} trigger={['click']}>
                            <Button type="text" icon={<MoreOutlined />} size="small" />
                        </Dropdown>
                    )}
                </div>
            )}
        />
    );
}; 