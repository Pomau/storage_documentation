import React, { useEffect, useState } from 'react';
import { Layout, Typography, Tabs } from 'antd';
import { ApprovalProcess } from '../types/document';
import { getApprovals } from '../api/approvals';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

export const ProcessesPage: React.FC = () => {
    const [activeProcesses, setActiveProcesses] = useState<ApprovalProcess[]>([]);
    const [completedProcesses, setCompletedProcesses] = useState<ApprovalProcess[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProcesses = async () => {
            setLoading(true);
            try {
                const [active, completed] = await Promise.all([
                    getApprovals(1, 'pending'),
                    getApprovals(1, 'completed')
                ]);
                setActiveProcesses(active);
                setCompletedProcesses(completed);
            } catch (error) {
                console.error('Ошибка загрузки процессов:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProcesses();
    }, []);

    return (
        <Content style={{ padding: '24px' }}>
            <Title level={2}>Процессы согласования</Title>
            
            <Tabs defaultActiveKey="active">
                <TabPane tab="Активные процессы" key="active">
                    {/* Компонент списка активных процессов */}
                </TabPane>
                <TabPane tab="Завершенные процессы" key="completed">
                    {/* Компонент списка завершенных процессов */}
                </TabPane>
            </Tabs>
        </Content>
    );
}; 