import React, { useState } from 'react'
import { Layout, Menu, Button, Space, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
	FileOutlined,
	CheckOutlined,
	LogoutOutlined,
	SearchOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../api/auth'

const { Header, Sider, Content } = Layout

const searchInputStyle: React.CSSProperties = {
	flex: 1,
	maxWidth: '800px',
	'.ant-input': {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderColor: 'transparent',
		color: 'white',
	},
	'.ant-input-search-button': {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderColor: 'transparent',
		color: 'white',
		width: '40px',
		height: '40px',
	},
	'.ant-input::placeholder': {
		color: 'rgba(255, 255, 255, 0.5)',
	},
	'.ant-input-search .ant-input:hover, .ant-input-search .ant-input:focus': {
		borderColor: '#1890ff',
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
	},
	'.ant-input-search .ant-input-search-button:hover': {
		backgroundColor: '#1890ff',
		borderColor: '#1890ff',
	},
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [searchQuery, setSearchQuery] = useState('')

	const menuItems = [
		{
			key: 'documents',
			icon: <FileOutlined />,
			label: 'Документы',
			onClick: () => navigate('/documents'),
		},
		{
			key: 'approvals',
			icon: <CheckOutlined />,
			label: 'На согласование',
			onClick: () => navigate('/approvals'),
		},
		{
			key: 'documents-search',
			icon: <SearchOutlined />,
			label: 'Поиск документов',
			onClick: () => navigate('/documents/search'),
		},
	]

	const handleSearch = (value: string) => {
		navigate(`/documents/search?q=${encodeURIComponent(value)}`)
	}

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header
				style={{
					padding: '0 24px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: '24px',
					background: '#001529',
				}}
			>
				<div
					style={{
						color: 'white',
						fontSize: '18px',
						whiteSpace: 'nowrap',
					}}
				>
					Система управления документами
				</div>
				<Input.Search
					placeholder='Поиск по документам...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					onSearch={handleSearch}
					style={searchInputStyle}
					enterButton={<SearchOutlined />}
					className='header-search'
				/>
				<Space style={{ whiteSpace: 'nowrap' }}>
					<span style={{ color: 'white' }}>
						{user?.first_name} {user?.last_name}
					</span>
				</Space>
			</Header>
			<Layout>
				<Sider width={200}>
					<Menu
						mode='inline'
						defaultSelectedKeys={['documents']}
						style={{ height: '100%', borderRight: 0 }}
						items={menuItems}
					/>
				</Sider>
				<Content style={{ background: '#fff' }}>{children}</Content>
			</Layout>
		</Layout>
	)
}
