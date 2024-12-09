import React from 'react'
import { Input, Select, DatePicker, Form, Button, Space } from 'antd'

const { Option } = Select

interface SearchBarProps {
	onSearch: (values: any) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
	const [form] = Form.useForm()

	const handleSearch = (values: any) => {
		onSearch(values)
	}

	return (
		<Form form={form} onFinish={handleSearch} layout='inline'>
			<Form.Item name='query'>
				<Input.Search
					placeholder='Поиск по документам...'
					style={{ width: 300 }}
					allowClear
					value=''
				/>
			</Form.Item>

			<Form.Item name='status'>
				<Select style={{ width: 150 }} placeholder='Статус'>
					<Option value='Черновик'>Черновик</Option>
					<Option value='Рассматривается'>Рассматривается</Option>
					<Option value='Утвержден'>Утвержден</Option>
					<Option value='Отклонен'>Отклонен</Option>
				</Select>
			</Form.Item>

			<Form.Item name='date_range'>
				<DatePicker.RangePicker />
			</Form.Item>

			<Form.Item>
				<Space>
					<Button type='primary' htmlType='submit'>
						Поиск
					</Button>
					<Button onClick={() => form.resetFields()}>Сбросить</Button>
				</Space>
			</Form.Item>
		</Form>
	)
}
