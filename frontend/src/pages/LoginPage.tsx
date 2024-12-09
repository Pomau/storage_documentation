import React from 'react';
import { Layout, Typography } from 'antd';
import { LoginForm } from '../components/LoginForm';

const { Content } = Layout;
const { Title } = Typography;

export const LoginPage: React.FC = () => {
    return (
        <Layout>
            <Content style={{ 
                padding: '50px', 
                maxWidth: '400px', 
                margin: '0 auto',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
                    Вход в систему
                </Title>
                <LoginForm />
            </Content>
        </Layout>
    );
}; 