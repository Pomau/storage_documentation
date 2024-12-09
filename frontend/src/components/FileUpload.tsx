import React, { useState } from 'react'
import {
	Upload,
	Button,
	message,
	Form,
	Input,
	DatePicker,
	InputNumber,
	Alert,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { uploadFile } from '../api/folders'

interface FileUploadProps {
	folderId: number
	onSuccess: () => void
}

interface DocumentMetadata {
	title: string
	receipt_date: string
	deadline_date: string
	incoming_number: string
	contact_person: string
	kopuk: number
	museum_name: string
	founder: string
	founder_inn: string
	document_type: string
	metadata: any
}

export const FileUpload: React.FC<FileUploadProps> = ({
	folderId,
	onSuccess,
}) => {
	const [form] = Form.useForm()
	const [fileList, setFileList] = useState<UploadFile[]>([])
	const [uploading, setUploading] = useState(false)

	const handleUpload = async (values: any) => {
		if (fileList.length === 0) {
			message.error('Пожалуйста, выберите файл')
			return
		}

		const file = fileList[0].originFileObj
		if (!file) return

		const metadata: DocumentMetadata = {
			title: values.title,
			receipt_date: values.receipt_date.format('YYYY-MM-DD'),
			deadline_date: values.deadline_date.format('YYYY-MM-DD'),
			incoming_number: values.incoming_number,
			contact_person: values.contact_person || '',
			kopuk: values.kopuk,
			museum_name: values.museum_name,
			founder: values.founder,
			founder_inn: values.founder_inn,
			document_type: '',
			metadata: {},
		}

		setUploading(true)
		try {
			await uploadFile(folderId, file, metadata)
			message.success('Файл успешно загружен')
			setFileList([])
			form.resetFields()
			onSuccess()
		} catch (error) {
			console.error('Upload error:', error)
			message.error('Ошибка при загрузке файла')
		} finally {
			setUploading(false)
		}
	}

	const beforeUpload = (file: File) => {
		// Проверка типа файла
		const isAllowed =
			file.type === 'application/pdf' ||
			file.type === 'application/msword' ||
			file.type ===
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		if (!isAllowed) {
			message.error('Можно загружать только PDF и DOC/DOCX файлы!')
			return false
		}

		// Проверка размера файла (менее 10MB)
		const isLt10M = file.size / 1024 / 1024 < 10
		if (!isLt10M) {
			message.error('Размер файла должен быть меньше 10MB!')
			return false
		}

		return false // Предотвращаем автоматическую загрузку
	}

	return (
		<Form form={form} onFinish={handleUpload} layout='vertical'>
			<Alert
				message={`Загрузка файла в папку ID: ${folderId}`}
				type='info'
				showIcon
				style={{ marginBottom: 16 }}
			/>
			<Form.Item
				name='title'
				label='Название документа'
				rules={[{ required: true, message: 'Введите название документа' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				name='receipt_date'
				label='Дата поступления'
				rules={[{ required: true, message: 'Выберите дату поступления' }]}
			>
				<DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
			</Form.Item>

			<Form.Item
				name='deadline_date'
				label='Срок исполнения'
				rules={[{ required: true, message: 'Выберите срок исполнения' }]}
			>
				<DatePicker style={{ width: '100%' }} format='YYYY-MM-DD' />
			</Form.Item>

			<Form.Item
				name='incoming_number'
				label='Входящий номер'
				rules={[{ required: true, message: 'Введите входящий номер' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item name='contact_person' label='Контактное лицо'>
				<Input />
			</Form.Item>

			<Form.Item
				name='kopuk'
				label='КОПУК'
				rules={[{ required: true, message: 'Введите КОПУК' }]}
			>
				<InputNumber style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item
				name='museum_name'
				label='Название музея'
				rules={[{ required: true, message: 'Введите название музея' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				name='founder'
				label='Учредитель'
				rules={[{ required: true, message: 'Введите учредителя' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				name='founder_inn'
				label='ИНН учредителя'
				rules={[
					{ required: true, message: 'Введите ИНН' },
					{ pattern: /^\d{10}(\d{2})?$/, message: 'Неверный формат ИНН' },
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item label='Файл' required>
				<Upload
					fileList={fileList}
					beforeUpload={beforeUpload}
					onChange={({ fileList }) => setFileList(fileList)}
					maxCount={1}
				>
					<Button icon={<UploadOutlined />}>Выбрать файл</Button>
				</Upload>
			</Form.Item>

			<Form.Item>
				<Button
					type='primary'
					htmlType='submit'
					loading={uploading}
					disabled={fileList.length === 0}
				>
					Загрузить
				</Button>
			</Form.Item>
		</Form>
	)
}
