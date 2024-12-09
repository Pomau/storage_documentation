import { api } from './api'
import { ApprovalProcess } from '../types/document'

export const getApprovals = async () => {
	try {
		const response = await api.get<{
			success: boolean
			data: ApprovalProcess[]
		}>('/approvals')
		if (response.data.success) {
			return response.data.data
		}
		return []
	} catch (error) {
		console.error('Error fetching approvals:', error)
		return []
	}
}

export const getApprovalDetails = async (
	processId: number
): Promise<ApprovalProcess> => {
	const { data } = await api.get<ApprovalProcess>(`/approvals/${processId}`)
	return data
}

export const startApprovalProcess = (
	documentId: number,
	approverIds: number[]
) => api.post(`/documents/${documentId}/approve`, { approverIds })

interface ApiResponse {
	success: boolean
	error?: string
	data?: any
}

export const approveDocument = async (
	processId: number,
	approved: boolean,
	comment: string,
	userId: number
) => {
	const response = await api.post<ApiResponse>(
		`/approvals/${processId}/approve`,
		{
			approved,
			comment,
			user_id: userId,
		}
	)
	return response.data
}
