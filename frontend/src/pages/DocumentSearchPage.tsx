import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
	Card,
	List,
	Tag,
	Space,
	Button,
	Drawer,
	Form,
	Select,
	DatePicker,
	Input,
	Collapse,
	Empty,
	Spin,
} from 'antd'
import { SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons'
import { Document, DocumentType } from '../types/document'
import { searchDocuments, getDocumentTypes } from '../api/documents'
import dayjs from 'dayjs'
import { message } from 'antd'

const { Panel } = Collapse

interface SearchFilters {
	status?: string[]
	documentType?: string[]
	dateRange?: [string, string]
	museum?: string[]
	founder?: string[]
}

export const DocumentSearchPage: React.FC = () => {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
	const [documents, setDocuments] = useState<Document[]>([])
	const [loading, setLoading] = useState(false)
	const [showFilters, setShowFilters] = useState(false)
	const [filters, setFilters] = useState<SearchFilters>({})
	const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
	const [facets, setFacets] = useState({
		statuses: new Map<string, number>(),
		types: new Map<string, number>(),
		museums: new Map<string, number>(),
		founders: new Map<string, number>(),
	})

	useEffect(() => {
		const loadData = async () => {
			try {
				const types = await getDocumentTypes()
				setDocumentTypes(types)

				const queryParam = searchParams.get('q')
				if (queryParam) {
					setSearchQuery(queryParam)
					setLoading(true)
					const results = await searchDocuments(queryParam, filters)
					setDocuments(results || [])
				}
			} catch (error) {
				console.error('Ошибка загрузки данных:', error)
				setDocuments([])
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [searchParams])

	useEffect(() => {
		calculateFacets()
	}, [documents])

	const calculateFacets = () => {
		const newFacets = {
			statuses: new Map<string, number>(),
			types: new Map<string, number>(),
			museums: new Map<string, number>(),
			founders: new Map<string, number>(),
		}

		documents.forEach(doc => {
			// Подсчет статусов
			const status = doc.status
			newFacets.statuses.set(status, (newFacets.statuses.get(status) || 0) + 1)

			// Подсчет типов
			if (doc.document_type) {
				newFacets.types.set(
					doc.document_type,
					(newFacets.types.get(doc.document_type) || 0) + 1
				)
			}

			// Подсчет музеев
			newFacets.museums.set(
				doc.museum_name,
				(newFacets.museums.get(doc.museum_name) || 0) + 1
			)

			// Подсчет учредителей
			newFacets.founders.set(
				doc.founder,
				(newFacets.founders.get(doc.founder) || 0) + 1
			)
		})

		setFacets(newFacets)
	}

	const handleSearch = async (value: string) => {
		setLoading(true)
		try {
			const searchParams = new URLSearchParams()
			if (value) searchParams.set('q', value)

			if (filters.status?.length) {
				searchParams.set('status', filters.status.join(','))
			}
			if (filters.documentType?.length) {
				searchParams.set('documentType', filters.documentType.join(','))
			}
			if (filters.dateRange?.length) {
				searchParams.set('dateFrom', filters.dateRange[0])
				searchParams.set('dateTo', filters.dateRange[1])
			}
			setSearchParams(searchParams)

			const results = await searchDocuments(value, filters)
			setDocuments(results || [])
		} catch (error) {
			console.error('Ошибка поиска:', error)
			setDocuments([])
			message.error('Ошибка при поиске документов')
		} finally {
			setLoading(false)
		}
	}

	const handleFilterChange = (newFilters: SearchFilters) => {
		setFilters(newFilters)
		handleSearch(searchQuery)
	}

	const handleStatusChange = (values: string[]) => {
		handleFilterChange({ ...filters, status: values })
	}

	const handleDateRangeChange = (dates: any) => {
		if (dates) {
			handleFilterChange({
				...filters,
				dateRange: [
					dates[0].format('YYYY-MM-DD'),
					dates[1].format('YYYY-MM-DD'),
				],
			})
		} else {
			handleFilterChange({ ...filters, dateRange: undefined })
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Черновик':
				return 'default'
			case 'Рассматривается':
				return 'processing'
			case 'Утвержден':
				return 'success'
			case 'Отклонен':
				return 'error'
			default:
				return 'default'
		}
	}

	// Обработчик клика по фасету
	const handleFacetClick = (type: string, value: string) => {
		const newFilters = { ...filters }

		switch (type) {
			case 'status':
				if (!newFilters.status) {
					newFilters.status = [value]
				} else if (newFilters.status.includes(value)) {
					// Если значение уже есть - удаляем его
					newFilters.status = newFilters.status.filter(s => s !== value)
					// Если массив стал пустым - удаляем свойство
					if (newFilters.status.length === 0) {
						delete newFilters.status
					}
				} else {
					newFilters.status.push(value)
				}
				break
			case 'documentType':
				if (!newFilters.documentType) {
					newFilters.documentType = [value]
				} else if (newFilters.documentType.includes(value)) {
					newFilters.documentType = newFilters.documentType.filter(
						t => t !== value
					)
					if (newFilters.documentType.length === 0) {
						delete newFilters.documentType
					}
				} else {
					newFilters.documentType.push(value)
				}
				break
			case 'museum':
				if (!newFilters.museum) {
					newFilters.museum = [value]
				} else if (newFilters.museum.includes(value)) {
					newFilters.museum = newFilters.museum.filter(m => m !== value)
					if (newFilters.museum.length === 0) {
						delete newFilters.museum
					}
				} else {
					newFilters.museum.push(value)
				}
				break
			case 'founder':
				if (!newFilters.founder) {
					newFilters.founder = [value]
				} else if (newFilters.founder.includes(value)) {
					newFilters.founder = newFilters.founder.filter(f => f !== value)
					if (newFilters.founder.length === 0) {
						delete newFilters.founder
					}
				} else {
					newFilters.founder.push(value)
				}
				break
		}

		handleFilterChange(newFilters)
	}

	// Проверка активности фасета
	const isFilterActive = (type: string, value: string): boolean => {
		switch (type) {
			case 'status':
				return filters.status?.includes(value) || false
			case 'documentType':
				return filters.documentType?.includes(value) || false
			case 'museum':
				return filters.museum?.includes(value) || false
			case 'founder':
				return filters.founder?.includes(value) || false
			default:
				return false
		}
	}

	const highlightText = (text: string, query: string) => {
		if (!query || !text) return text

		// Экранируем специальные символы в поисковом запросе
		const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

		try {
			// Находим индекс первого вхождения (без учета регистра)
			const lowerText = text.toLowerCase()
			const lowerQuery = query.toLowerCase()
			const index = lowerText.indexOf(lowerQuery)

			if (index === -1) return text

			// Получаем контекст вокруг найденного текста
			const start = Math.max(0, index - 50)
			const end = Math.min(text.length, index + query.length + 50)
			const contextText = text.slice(start, end)

			// Создаем регулярное выражение для подсветки всех вхождений в контексте
			const regex = new RegExp(`(${escapedQuery})`, 'gi')
			const parts = contextText.split(regex)

			return (
				<span>
					{start > 0 && '...'}
					{parts.map((part, i) => {
						const isMatch = part.toLowerCase() === query.toLowerCase()
						return isMatch ? (
							<span key={i} style={{ backgroundColor: '#ffd54f' }}>
								{part}
							</span>
						) : (
							<span key={i}>{part}</span>
						)
					})}
					{end < text.length && '...'}
				</span>
			)
		} catch (error) {
			console.error('Error highlighting text:', error)
			return text
		}
	}

	return (
		<div style={{ padding: '24px' }}>
			<Card title='Поиск документов'>
				<Space direction='vertical' style={{ width: '100%' }}>
					<Input.Search
						placeholder='Поиск по документам, содержимому и метаданным...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						onSearch={handleSearch}
						enterButton={<SearchOutlined />}
						size='large'
						allowClear
					/>
					<Space>
						<Tag>Найдено: {documents.length}</Tag>
					</Space>
				</Space>
			</Card>

			{loading ? (
				<div style={{ textAlign: 'center', padding: '50px' }}>
					<Spin size='large' />
				</div>
			) : documents.length === 0 ? (
				<Empty
					description='Документы не найдены'
					style={{ marginTop: '50px' }}
				/>
			) : (
				<div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
					{/* Фасеты слева */}
					<div style={{ width: '300px' }}>
						<Space
							style={{ marginBottom: '16px' }}
							direction='vertical'
							style={{ width: '100%' }}
						>
							<Button
								type='primary'
								onClick={() => handleSearch(searchQuery)}
								icon={<FilterOutlined />}
								block
							>
								Применить фильтры
							</Button>
							<Button
								onClick={() => {
									setFilters({})
									handleSearch(searchQuery)
								}}
								block
							>
								Сбросить фильтры
							</Button>
						</Space>

						<Collapse defaultActiveKey={['1', '2', '3', '4']}>
							<Panel header='Статус' key='1'>
								{Array.from(facets.statuses.entries()).map(
									([status, count]) => (
										<div key={status} style={{ marginBottom: '8px' }}>
											<Tag
												style={{ cursor: 'pointer' }}
												onClick={() => handleFacetClick('status', status)}
												className={
													isFilterActive('status', status)
														? 'ant-tag-active'
														: ''
												}
											>
												{status} ({count})
											</Tag>
										</div>
									)
								)}
							</Panel>

							<Panel header='Тип документа' key='2'>
								{Array.from(facets.types.entries()).map(([type, count]) => (
									<div key={type} style={{ marginBottom: '8px' }}>
										<Tag
											style={{ cursor: 'pointer' }}
											onClick={() => handleFacetClick('documentType', type)}
											className={
												isFilterActive('documentType', type)
													? 'ant-tag-active'
													: ''
											}
										>
											{documentTypes.find(t => t.id === type)?.name || type} (
											{count})
										</Tag>
									</div>
								))}
							</Panel>

							<Panel header='Музеи' key='3'>
								{Array.from(facets.museums.entries()).map(([museum, count]) => (
									<div key={museum} style={{ marginBottom: '8px' }}>
										<Tag
											style={{ cursor: 'pointer' }}
											onClick={() => handleFacetClick('museum', museum)}
											className={
												isFilterActive('museum', museum) ? 'ant-tag-active' : ''
											}
										>
											{museum} ({count})
										</Tag>
									</div>
								))}
							</Panel>

							<Panel header='Учредители' key='4'>
								{Array.from(facets.founders.entries()).map(
									([founder, count]) => (
										<div key={founder} style={{ marginBottom: '8px' }}>
											<Tag
												style={{ cursor: 'pointer' }}
												onClick={() => handleFacetClick('founder', founder)}
												className={
													isFilterActive('founder', founder)
														? 'ant-tag-active'
														: ''
												}
											>
												{founder} ({count})
											</Tag>
										</div>
									)
								)}
							</Panel>
						</Collapse>
					</div>

					{/* Список результатов справа */}
					<div style={{ flex: 1 }}>
						<List
							loading={loading}
							itemLayout='vertical'
							dataSource={documents}
							renderItem={doc => (
								<List.Item
									key={doc.id}
									extra={
										<Space>
											<Button
												icon={<EyeOutlined />}
												onClick={() => navigate(`/documents/${doc.id}`)}
											>
												Просмотр
											</Button>
											<Tag
												color={getStatusColor(doc.status)}
												style={{ cursor: 'default' }}
											>
												{doc.status}
											</Tag>
											{doc.document_type && (
												<Tag style={{ cursor: 'default' }}>
													{
														documentTypes.find(t => t.id === doc.document_type)
															?.name
													}
												</Tag>
											)}
										</Space>
									}
								>
									<List.Item.Meta
										title={doc.title}
										description={
											<Space direction='vertical'>
												<div>Музей: {doc.museum_name}</div>
												<div>Учредитель: {doc.founder}</div>
												{doc.file_content &&
													doc.file_content.includes(searchQuery) && (
														<div>
															Найдено в содержимом файла:
															<div
																style={{
																	backgroundColor: '#f5f5f5',
																	padding: '8px',
																	borderRadius: '4px',
																	marginTop: '4px',
																}}
															>
																{(() => {
																	const index = doc.file_content
																		.toLowerCase()
																		.indexOf(searchQuery.toLowerCase())

																	if (index === -1) return null

																	const start = Math.max(0, index - 50)
																	const end = Math.min(
																		doc.file_content.length,
																		index + searchQuery.length + 50
																	)
																	const contextText =
																		doc.file_content.substring(start, end)

																	return (
																		<>
																			{highlightText(contextText, searchQuery)}
																			{end < doc.file_content.length && '...'}
																		</>
																	)
																})()}
															</div>
														</div>
													)}
											</Space>
										}
									/>
								</List.Item>
							)}
						/>
					</div>
				</div>
			)}

			{/* Drawer с фильтрами */}
			<Drawer
				title='Фильтры поиска'
				placement='right'
				onClose={() => setShowFilters(false)}
				open={showFilters}
				width={400}
			>
				<Form layout='vertical'>
					<Form.Item label='Статус'>
						<Select
							mode='multiple'
							placeholder='Выберите статусы'
							value={filters.status}
							onChange={handleStatusChange}
						>
							<Select.Option value='Черновик'>Черновик</Select.Option>
							<Select.Option value='Рассматривается'>
								Рассматривается
							</Select.Option>
							<Select.Option value='Утвержден'>Утвержден</Select.Option>
							<Select.Option value='Отклонен'>Отклонен</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item label='Тип документа'>
						<Select
							mode='multiple'
							placeholder='Выберите типы'
							value={filters.documentType}
							onChange={value =>
								handleFilterChange({ ...filters, documentType: value })
							}
						>
							{documentTypes.map(type => (
								<Select.Option key={type.id} value={type.id}>
									{type.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label='Период'>
						<DatePicker.RangePicker
							style={{ width: '100%' }}
							value={
								filters.dateRange
									? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
									: null
							}
							onChange={handleDateRangeChange}
						/>
					</Form.Item>
				</Form>
			</Drawer>
		</div>
	)
}
