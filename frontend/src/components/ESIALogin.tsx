import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authenticateWithESIA } from '../api/auth';

const { Title } = Typography;

export const ESIALogin: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        // URL для авторизации в ЕСИА (получаем с бэкенда)
        const esiaUrl = `${process.env.REACT_APP_API_URL}/auth/esia`;
        window.location.href = esiaUrl;
    };

    React.useEffect(() => {
        // Проверяем наличие кода авторизации в URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            authenticateWithESIA(code)
                .then(() => {
                    navigate('/documents');
                })
                .catch((error) => {
                    console.error('Ошибка авторизации:', error);
                });
        }
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '48px' }}>
            <Title level={2}>Вход в систему</Title>
            <Button type="primary" size="large" onClick={handleLogin}>
                Войти через Госуслуги
            </Button>
        </div>
    );
}; 