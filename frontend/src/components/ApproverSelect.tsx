import React from 'react';
import { Select, Form, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

interface Approver {
    id: number;
    name: string;
    position: string;
}

interface ApproverSelectProps {
    approvers: Approver[];
    onSubmit: (selectedApprovers: number[]) => void;
}

export const ApproverSelect: React.FC<ApproverSelectProps> = ({ approvers, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        const selectedIds = values.approvers.map((item: any) => item.approver);
        onSubmit(selectedIds);
    };

    return (
        <Form form={form} onFinish={handleSubmit}>
            <Form.List name="approvers">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field, index) => (
                            <Space key={field.key} align="baseline">
                                <Form.Item
                                    {...field}
                                    label={`Подписант ${index + 1}`}
                                    required
                                    name={[field.name, 'approver']}
                                >
                                    <Select style={{ width: 300 }}>
                                        {approvers.map(approver => (
                                            <Select.Option key={approver.id} value={approver.id}>
                                                {approver.name} - {approver.position}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(field.name)} />
                            </Space>
                        ))}
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Добавить подписанта
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Начать процесс согласования
                </Button>
            </Form.Item>
        </Form>
    );
}; 