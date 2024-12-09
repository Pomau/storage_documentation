import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Input, message, Empty } from 'antd';
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

export const ApprovalsPage: React.FC = () => {
    const [tasks, setTasks] = useState<ApprovalTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
    const [comment, setComment] = useState('');

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
        if (!selectedTask) return;

        try {
            await approveDocument(selectedTask.id, approved, comment);
            message.success(`Документ ${approved ? 'утвержден' : 'отклонен'}`);
            setModalVisible(false);
            loadTasks();
        } catch (error) {
            message.error('Ошибка при обработке документа');
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
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
        },
        {
            title: 'Действия',
            render: (_: any, record: ApprovalTask) => (
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
            ),
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
                }}
                footer={[
                    <Button key="reject" danger onClick={() => handleApprove(false)}>
                        Отклонить
                    </Button>,
                    <Button key="approve" type="primary" onClick={() => handleApprove(true)}>
                        Утвердить
                    </Button>,
                ]}
            >
                <Input.TextArea
                    placeholder="Комментарий"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                />
            </Modal>
        </div>
    );
}; 