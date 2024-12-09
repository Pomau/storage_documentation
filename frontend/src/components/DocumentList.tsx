import React from 'react';
import { Table, Tag, Space, Button } from 'antd';
import { EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types/document';
import { FileDownload } from './FileDownload';

interface DocumentListProps {
    documents: Document[];
    loading?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, loading }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Входящий номер',
            dataIndex: 'incoming_number',
            key: 'incoming_number',
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                switch (status) {
                    case 'Черновик': color = 'default'; break;
                    case 'Рассматривается': color = 'processing'; break;
                    case 'Утвержден': color = 'success'; break;
                    case 'Отклонен': color = 'error'; break;
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: any, record: Document) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/documents/${record.id}`)}
                    >
                        Просмотр/Редактирование
                    </Button>
                    <FileDownload 
                        fileId={record.id} 
                        fileName={record.file_path ? record.file_path.split('/').pop() || 'document' : 'document'}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            loading={loading}
            pagination={false}
        />
    );
}; 