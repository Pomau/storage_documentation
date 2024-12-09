import React from 'react';
import { Table, Button, Space, Tag, Modal } from 'antd';
import { ApprovalProcess } from '../types/document';
import { ApprovalForm } from './ApprovalForm';
import { approveDocument } from '../api/documents';

interface ApprovalListProps {
    approvals: ApprovalProcess[];
    loading?: boolean;
    readonly?: boolean;
    onApprovalComplete?: () => void;
}

export const ApprovalList: React.FC<ApprovalListProps> = ({
    approvals,
    loading,
    readonly,
    onApprovalComplete
}) => {
    const [selectedProcess, setSelectedProcess] = React.useState<ApprovalProcess | null>(null);

    const handleApprove = async (processId: number, approved: boolean, comment: string) => {
        try {
            await approveDocument(processId, approved, comment);
            setSelectedProcess(null);
            onApprovalComplete?.();
        } catch (error) {
            Modal.error({
                title: 'Ошибка',
                content: 'Не удалось сохранить решение'
            });
        }
    };

    const columns = [
        {
            title: 'Документ',
            dataIndex: ['document', 'title'],
            key: 'title',
        },
        {
            title: 'Музей',
            dataIndex: ['document', 'museum_name'],
            key: 'museum_name',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'В процессе' ? 'processing' : 'success';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (text: string, record: ApprovalProcess) => (
                <Space>
                    {!readonly && record.status === 'В процессе' && (
                        <Button
                            type="primary"
                            onClick={() => setSelectedProcess(record)}
                        >
                            Рассмотреть
                        </Button>
                    )}
                    <Button type="link" onClick={() => window.open(record.document.file_path)}>
                        Просмотреть документ
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={approvals}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title="Рассмотрение документа"
                open={!!selectedProcess}
                onCancel={() => setSelectedProcess(null)}
                footer={null}
                width={600}
            >
                {selectedProcess && (
                    <ApprovalForm
                        processId={selectedProcess.id}
                        onSubmit={handleApprove}
                    />
                )}
            </Modal>
        </>
    );
}; 