import React from 'react';
import { Timeline, Tag } from 'antd';
import { Approver } from '../types/document';

interface ApprovalHistoryProps {
    approvers: Approver[];
}

export const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ approvers }) => {
    return (
        <Timeline>
            {approvers.map((approver) => (
                <Timeline.Item
                    key={approver.id}
                    color={getStatusColor(approver.status)}
                >
                    <div>
                        <strong>{approver.user.first_name} {approver.user.last_name}</strong>
                        <Tag color={getStatusColor(approver.status)} style={{ marginLeft: 8 }}>
                            {approver.status}
                        </Tag>
                    </div>
                    {approver.comment && (
                        <div style={{ marginTop: 8 }}>{approver.comment}</div>
                    )}
                    {approver.approved_at && (
                        <div style={{ color: '#888', fontSize: 12 }}>
                            {new Date(approver.approved_at).toLocaleString()}
                        </div>
                    )}
                </Timeline.Item>
            ))}
        </Timeline>
    );
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Утверждено':
            return 'success';
        case 'Отклонено':
            return 'error';
        default:
            return 'processing';
    }
}; 