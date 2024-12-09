import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, message } from 'antd';
import { DocumentForm } from '../components/DocumentForm';
import { createDocument } from '../api/documents';
import { Document } from '../types/document';

const { Content } = Layout;
const { Title } = Typography;

export const CreateDocumentPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = async (document: Partial<Document>, file: File) => {
        try {
            await createDocument(document, file);
            message.success('Документ успешно создан');
            navigate('/documents');
        } catch (error) {
            message.error('Ошибка при создании документа');
            throw error;
        }
    };

    return (
        <Content style={{ padding: '24px' }}>
            <Title level={2}>Создание документа</Title>
            <DocumentForm onSubmit={handleSubmit} />
        </Content>
    );
}; 