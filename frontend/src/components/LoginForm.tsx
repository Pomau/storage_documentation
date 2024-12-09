import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleSubmit = async (values: { email: string; password: string }) => {
        try {
            await login(values.email, values.password);
            message.success('Успешный вход');
            navigate('/documents');
        } catch (error) {
            message.error('Ошибка входа');
        }
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Введите email' },
                    { type: 'email', message: 'Введите корректный email' }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="password"
                label="Пароль"
                rules={[{ required: true, message: 'Введите пароль' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Войти
                </Button>
            </Form.Item>
        </Form>
    );
}; 