import axios from 'axios';

export const apiClient = axios.create({
	baseURL: 'https://pomau.ru/api',
	headers: {
		'Content-Type': 'application/json',
	},
})
