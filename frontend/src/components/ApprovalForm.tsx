import React, { useState } from 'react';
import { Form, Select, Button, message } from 'antd';
import { startApprovalProcess } from '../api/approvals';

interface ApprovalFormProps {
    documentId: number;
    onSuccess: () => void;
}

export const ApprovalForm: React.FC<ApprovalFormProps> = ({ documentId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Фиктивный список подписантов для демонстрации
    const approvers = [
        { id: 1, name: 'Руководитель отдела' },
        { id: 2, name: 'Начальник управления' },
        { id: 3, name: 'Директор' },
        { id: 4, name: 'Юрист' },
    ];

    const handleSubmit = async (values: { approvers: number[] }) => {
        if (!values.approvers?.length) {
            message.error('Выберите хотя бы одного подписанта');
            return;
        }

        setLoading(true);
        try {
            await startApprovalProcess(documentId, values.approvers);
            message.success('Процесс согласования запущен');
            onSuccess();
        } catch (error) {
            console.error('Error starting approval process:', error);
            message.error('Ошибка при запуске процесса согласования');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="approvers"
                label="Подписанты"
                rules={[{ required: true, message: 'Выберите подписантов' }]}
                extra="Выберите сотрудников, которые должны согласовать документ"
            >
                <Select
                    mode="multiple"
                    placeholder="Выберите подписантов"
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                >
                    {approvers.map(user => (
                        <Select.Option key={user.id} value={user.id}>
                            {user.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                >
                    Отправить на согласование
                </Button>
            </Form.Item>
        </Form>
    );
}; 