import React from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadFile } from '../api/folders';

interface FileDownloadProps {
    fileId: number;
    fileName: string;
}

export const FileDownload: React.FC<FileDownloadProps> = ({ fileId, fileName }) => {
    const handleDownload = async () => {
        try {
            const blob = await downloadFile(fileId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            message.error('Ошибка при скачивании файла');
        }
    };

    return (
        <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
        >
            Скачать
        </Button>
    );
}; 