import axios from 'axios';
import { message } from 'antd';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            message.error(error.response.data.message || 'Произошла ошибка');
        } else if (error.request) {
            message.error('Ошибка сети');
        } else {
            message.error('Произошла ошибка');
        }
        return Promise.reject(error);
    }
); 