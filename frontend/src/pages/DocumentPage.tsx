import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, DatePicker, Select, Button, Space, message, Spin, Alert, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Document, DocumentType, FieldConfig } from '../types/document';
import { getDocument, updateDocument, getDocumentTypes } from '../api/documents';
import { ApprovalForm } from '../components/ApprovalForm';

export const DocumentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [document, setDocument] = useState<Document | null>(null);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
    const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Сначала загружаем типы документов
                const types = await getDocumentTypes();
                setDocumentTypes(types);
                
                // Затем пытаемся загрузить документ, если есть id
                if (id) {
                    try {
                        const doc = await getDocument(parseInt(id));
                        setDocument(doc);
                        
                        // Заполняем форму базовыми полями
                        form.setFieldsValue({
                            ...doc,
                            receipt_date: dayjs(doc.receipt_date),
                            deadline_date: dayjs(doc.deadline_date),
                            metadata: doc.metadata,
                        });

                        // Если есть тип документа, пытаемся его найти и установить
                        if (doc.document_type) {
                            const type = types.find(t => t.id === doc.document_type);
                            if (type) {
                                setSelectedType(type);
                            } else {
                                // Если тип не найден, просто выводим предупреждение
                                message.warning('Тип документа не найден');
                            }
                        }
                    } catch (docError: any) {
                        if (docError.response?.status === 404) {
                            message.warning('Документ не найден');
                            navigate('/documents');
                        } else {
                            message.error('Ошибка загрузки документа');
                            console.error(docError);
                        }
                    }
                }
            } catch (error) {
                message.error('Ошибка загрузки типов документов');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, form, navigate]);

    const handleSave = async (values: any) => {
        if (!id || !selectedType) return;

        try {
            const updatedDoc = {
                title: values.title,
                receipt_date: values.receipt_date.format('YYYY-MM-DD'),
                deadline_date: values.deadline_date.format('YYYY-MM-DD'),
                incoming_number: values.incoming_number,
                contact_person: values.contact_person,
                kopuk: values.kopuk,
                museum_name: values.museum_name,
                founder: values.founder,
                founder_inn: values.founder_inn,
                document_type: selectedType.id,
                metadata: values.metadata || {},
            };

            await updateDocument(parseInt(id), updatedDoc);
            message.success('Документ сохранен');
            navigate('/documents');
        } catch (error) {
            message.error('Ошибка при сохранении документа');
            console.error(error);
        }
    };

    const renderField = (field: FieldConfig) => {
        switch (field.type) {
            case 'text':
                return <Input />;
            case 'number':
                return (
                    <InputNumber
                        style={{ width: '100%' }}
                        min={field.validation?.min}
                        max={field.validation?.max}
                    />
                );
            case 'date':
                return <DatePicker style={{ width: '100%' }} />;
            case 'select':
                if (!field.options || field.options.length === 0) {
                    return <Input placeholder="Нет доступных опций" disabled />;
                }
                return (
                    <Select 
                        style={{ width: '100%' }}
                        placeholder={`Выберите ${field.label.toLowerCase()}`}
                    >
                        {field.options.map(option => (
                            <Select.Option 
                                key={option.value} 
                                value={option.value}
                                title={option.label}
                            >
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                );
            default:
                return <Input />;
        }
    };

    const selectStyles = {
        select: {
            width: '100%',
        },
        option: {
            padding: '8px 12px',
            '&:hover': {
                backgroundColor: '#f5f5f5',
            },
        },
        optionSelected: {
            backgroundColor: '#e6f7ff',
            color: '#1890ff',
        },
    };

    const loadDocument = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            const doc = await getDocument(parseInt(id));
            setDocument(doc);
            
            // Обновляем форму
            form.setFieldsValue({
                ...doc,
                receipt_date: dayjs(doc.receipt_date),
                deadline_date: dayjs(doc.deadline_date),
                metadata: doc.metadata,
            });
        } catch (error) {
            console.error('Error loading document:', error);
            message.error('Ошибка загрузки документа');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title={document?.title || 'Загрузка...'}
                    extra={
                        <Space>
                            <Button 
                                type="primary"
                                onClick={() => setIsApprovalModalVisible(true)}
                                disabled={!document || document.status !== 'Черновик'}
                            >
                                Отправить на согласование
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        initialValues={document || {}}
                    >
                        <div style={{ marginBottom: 24 }}>
                            <Form.Item
                                label="Тип документа"
                                required={!document?.document_type}
                            >
                                <Select
                                    placeholder="Выберите тип документа"
                                    value={selectedType?.id}
                                    onChange={(value) => {
                                        const type = documentTypes.find(t => t.id === value);
                                        if (type) setSelectedType(type);
                                    }}
                                    style={{ width: '100%' }}
                                    disabled={!!document?.document_type}
                                >
                                    {documentTypes.map(type => (
                                        <Select.Option key={type.id} value={type.id}>
                                            {type.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {selectedType && (
                                <Alert
                                    message={selectedType.name}
                                    description={selectedType.description}
                                    type="info"
                                    showIcon
                                />
                            )}
                        </div>

                        {selectedType && (
                            <>
                                <Card title="Основная информация" style={{ marginBottom: 24 }}>
                                    <Form.Item
                                        name="title"
                                        label="Название документа"
                                        rules={[{ required: true, message: 'Введите название документа' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        name="receipt_date"
                                        label="Дата поступления"
                                        rules={[{ required: true, message: 'Выберите дату поступления' }]}
                                    >
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item
                                        name="deadline_date"
                                        label="Срок исполнения"
                                        rules={[{ required: true, message: 'Выберите срок исполнения' }]}
                                    >
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>

                                    <Form.Item
                                        name="incoming_number"
                                        label="Входящий номер"
                                        rules={[{ required: true, message: 'Введите входящий номер' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        name="contact_person"
                                        label="Контактное лицо"
                                    >
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
                                </Card>

                                <Card title={`Поля типа "${selectedType.name}"`}>
                                    {selectedType.fields.map(field => (
                                        <Form.Item
                                            key={field.key}
                                            name={['metadata', field.key]}
                                            label={field.label}
                                            rules={[
                                                {
                                                    required: field.required,
                                                    message: `Заполните поле "${field.label}"`,
                                                },
                                                ...(field.type === 'select' && field.options 
                                                    ? [{
                                                        validator: (_, value) => {
                                                            if (field.required && !value) {
                                                                return Promise.reject(`Выберите ${field.label.toLowerCase()}`);
                                                            }
                                                            if (value && !field.options?.find(opt => opt.value === value)) {
                                                                return Promise.reject(`Неверное значение для поля "${field.label}"`);
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    }]
                                                    : []
                                                ),
                                            ]}
                                            tooltip={field.type === 'select' && field.options?.length > 0 
                                                ? `Доступно ${field.options.length} вариантов`
                                                : undefined
                                            }
                                        >
                                            {renderField(field)}
                                        </Form.Item>
                                    ))}
                                </Card>
                            </>
                        )}

                        <Form.Item style={{ marginTop: 24 }}>
                            <Space>
                                <Button 
                                    type="primary" 
                                    icon={<SaveOutlined />} 
                                    htmlType="submit"
                                    disabled={!selectedType}
                                >
                                    Сохранить
                                </Button>
                                <Button onClick={() => navigate('/documents')}>
                                    Отмена
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>

                <Modal
                    title="Отправка на согласование"
                    open={isApprovalModalVisible}
                    onCancel={() => setIsApprovalModalVisible(false)}
                    footer={null}
                >
                    {document && (
                        <ApprovalForm
                            documentId={document.id}
                            onSuccess={() => {
                                setIsApprovalModalVisible(false);
                                message.success('Документ отправлен на согласование');
                                loadDocument(); // Перезагружаем документ для обновления статуса
                            }}
                        />
                    )}
                </Modal>
            </Space>
        </div>
    );
}; 