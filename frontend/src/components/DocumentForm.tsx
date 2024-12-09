import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { Document } from '../types/document';

interface DocumentFormProps {
    onSubmit: (document: Partial<Document>, file: File) => Promise<void>;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleSubmit = async (values: any) => {
        try {
            if (fileList.length === 0) {
                message.error('Необходимо загрузить файл');
                return;
            }

            const document: Partial<Document> = {
                ...values,
                receipt_date: values.receipt_date.toISOString(),
                deadline_date: values.deadline_date.toISOString(),
            };
            
            await onSubmit(document, fileList[0].originFileObj as File);
            message.success('Документ успешно создан');
            form.resetFields();
            setFileList([]);
        } catch (error) {
            message.error('Ошибка при создании документа');
        }
    };

    const beforeUpload = (file: File) => {
        // Проверка типа файла
        const isAllowed = file.type === 'application/pdf' || 
                         file.type === 'application/msword' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (!isAllowed) {
            message.error('Можно загружать только PDF и DOC/DOCX файлы!');
        }

        // Проверка размера файла (менее 10MB)
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Размер файла должен быть меньше 10MB!');
        }

        return false; // Предотвращаем автоматическую загрузку
    };

    const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setFileList(fileList.slice(-1)); // Оставляем только последний файл
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="title"
                label="Заголовок документа"
                rules={[{ required: true, message: 'Введите заголовок' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="receipt_date"
                label="Дата поступления"
                rules={[{ required: true, message: 'Выберите дату' }]}
            >
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="deadline_date"
                label="Срок исполнения"
                rules={[{ required: true, message: 'Выберите дату' }]}
            >
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="incoming_number"
                label="Входящий номер"
                rules={[{ required: true, message: 'Введите номер' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item name="contact_person" label="Контактное лицо">
                <Input />
            </Form.Item>

            <Form.Item
                name="kopuk"
                label="КОПУК"
                rules={[{ required: true, message: 'Введите КОПУК' }]}
            >
                <InputNumber style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="museum_name"
                label="Название музея"
                rules={[{ required: true, message: 'Введите название музея' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="founder"
                label="Учредитель"
                rules={[{ required: true, message: 'Введите учредителя' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="founder_inn"
                label="ИНН учредителя"
                rules={[
                    { required: true, message: 'Введите ИНН' },
                    { pattern: /^\d{10}(\d{2})?$/, message: 'Неверный формат ИНН' }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Файл документа"
                required
                tooltip="Поддерживаются форматы PDF, DOC, DOCX размером до 10MB"
            >
                <Upload
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    fileList={fileList}
                    maxCount={1}
                >
                    <Button icon={<UploadOutlined />}>Выберите файл</Button>
                </Upload>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" disabled={fileList.length === 0}>
                    Создать документ
                </Button>
            </Form.Item>
        </Form>
    );
}; 