import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, Select, message, Empty, Tag, Typography } from 'antd';
import { getApprovals, approveDocument } from '../api/approvals';

interface ApprovalTask {
    id: number;
    document: {
        id: number;
        title: string;
    };
    status: string;
    created_at: string;
}

const { Text } = Typography;

export const ApprovalsPage: React.FC = () => {
    const [tasks, setTasks] = useState<ApprovalTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
    const [comment, setComment] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number>(0);

    const users = [
        { id: 1, name: 'Руководитель отдела' },
        { id: 2, name: 'Начальник управления' },
        { id: 3, name: 'Директор' },
        { id: 4, name: 'Юрист' },
    ];

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await getApprovals();
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                setTasks([]);
                message.warning('Нет доступных заданий');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            message.error('Ошибка загрузки заданий');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (approved: boolean) => {
        if (!selectedTask || !selectedUserId) {
            message.error('Выберите пользователя');
            return;
        }

        try {
            const response = await approveDocument(selectedTask.id, approved, comment, selectedUserId);
            if (response.success === false) {
                message.error(response.error || 'Ошибка при обработке документа');
                return;
            }
            
            message.success(`Документ ${approved ? 'утвержден' : 'отклонен'}`);
            setModalVisible(false);
            setComment('');
            setSelectedUserId(0);
            loadTasks();
        } catch (error: any) {
            console.error('Error approving document:', error);
            message.error(error.response?.data?.error || 'Ошибка при обработке документа');
        }
    };

    const columns = [
        {
            title: 'Документ',
            dataIndex: ['document', 'title'],
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            render: (status: string) => {
                let color = 'default';
                switch (status) {
                    case 'В процессе': color = 'processing'; break;
                    case 'Завершен': color = 'success'; break;
                    case 'Отклонен': color = 'error'; break;
                }
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Действия',
            render: (_: any, record: ApprovalTask) => {
                if (record.status === 'В процессе') {
                    return (
                        <Space>
                            <Button 
                                type="primary"
                                onClick={() => {
                                    setSelectedTask(record);
                                    setModalVisible(true);
                                }}
                            >
                                Рассмотреть
                            </Button>
                        </Space>
                    );
                }
                return <Text type="secondary">Рассмотрено</Text>;
            },
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Задания на согласование</h1>
            {tasks.length === 0 && !loading ? (
                <Empty 
                    description="Нет заданий на согласование" 
                    style={{ marginTop: '40px' }}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={tasks}
                    loading={loading}
                    rowKey="id"
                />
            )}

            <Modal
                title="Рассмотрение документа"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setComment('');
                    setSelectedUserId(0);
                }}
                footer={[
                    <Button key="reject" danger onClick={() => handleApprove(false)} disabled={!selectedUserId}>
                        Отклонить
                    </Button>,
                    <Button key="approve" type="primary" onClick={() => handleApprove(true)} disabled={!selectedUserId}>
                        Утвердить
                    </Button>,
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Select
                        placeholder="Выберите пользователя"
                        style={{ width: '100%' }}
                        value={selectedUserId || undefined}
                        onChange={(value) => setSelectedUserId(value)}
                    >
                        {users.map(user => (
                            <Select.Option key={user.id} value={user.id}>
                                {user.name}
                            </Select.Option>
                        ))}
                    </Select>
                    <Input.TextArea
                        placeholder="Комментарий"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={4}
                    />
                </Space>
            </Modal>
        </div>
    );
}; 