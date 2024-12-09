import React, { useState, useEffect } from 'react'
import { Layout, Typography, Row, Col, Card } from 'antd'
import { FolderStructure } from '../components/FolderStructure'
import { DocumentList } from '../components/DocumentList'
import { getFolderTree } from '../api/folders'
import { FolderNode } from '../types/folder'
import { Document } from '../types/document'

const { Content } = Layout
const { Title } = Typography

export const DocumentsPage: React.FC = () => {
	const [folders, setFolders] = useState<FolderNode[]>([])
	const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null)
	const [documents, setDocuments] = useState<Document[]>([])
	const [loading, setLoading] = useState(false)

	// Функция для получения всех документов из всех папок
	const getAllDocuments = (nodes: FolderNode[]): Document[] => {
		let allDocs: Document[] = []
		nodes.forEach(node => {
			if (node.files) {
				allDocs = [...allDocs, ...node.files]
			}
			if (node.children) {
				allDocs = [...allDocs, ...getAllDocuments(node.children)]
			}
		})
		return allDocs
	}

	const loadFolders = async () => {
		try {
			setLoading(true)
			const data = await getFolderTree()
			setFolders(data)
			// Устанавливаем все документы по умолчанию
			setDocuments(getAllDocuments(data))
		} catch (error) {
			console.error('Ошибка загрузки папок:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadFolders()
	}, [])

	const handleSelect = (selectedKeys: string[]) => {
		const key = selectedKeys[0]
		if (key && key.startsWith('folder-')) {
			const folderId = parseInt(key.replace('folder-', ''))
			const folder = findFolder(folders, folderId)
			setSelectedFolder(folder)
			if (folder) {
				// Показываем документы только выбранной папки
				setDocuments(folder.files || [])
			}
		} else {
			// Если папка не выбрана, показываем все документы
			setSelectedFolder(null)
			setDocuments(getAllDocuments(folders))
		}
	}

	const findFolder = (nodes: FolderNode[], id: number): FolderNode | null => {
		for (const node of nodes) {
			if (node.id === id) return node
			if (node.children) {
				const found = findFolder(node.children, id)
				if (found) return found
			}
		}
		return null
	}

	return (
		<Content style={{ padding: '24px' }}>
			<Title level={2}>Документы</Title>
			<Row gutter={24}>
				<Col span={8}>
					<Card title="Структура папок">
						<FolderStructure
							folders={folders}
							onSelect={handleSelect}
							onFolderUpdate={loadFolders}
						/>
					</Card>
				</Col>
				<Col span={16}>
					<Card
						title={`Документы ${
							selectedFolder ? `- ${selectedFolder.name}` : '(все документы)'
						}`}
						loading={loading}
					>
						<DocumentList
							documents={documents}
							loading={loading}
						/>
					</Card>
				</Col>
			</Row>
		</Content>
	)
}
