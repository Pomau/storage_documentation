package models

type Role string

const (
	// Роли пользователей
	RoleAdmin    Role = "admin"
	RoleApprover Role = "approver"
	RoleEmployee Role = "employee"

	// Статусы документов
	StatusDraft    = "Черновик"
	StatusInReview = "Рассматривается"
	StatusApproved = "Утвержден"
	StatusRejected = "Отклонен"

	// Статусы процесса согласования
	ProcessStatusInProgress = "В процессе"
	ProcessStatusCompleted  = "Завершен"

	// Статусы утверждающих
	ApproverStatusPending  = "Ожидает"
	ApproverStatusApproved = "Утверждено"
	ApproverStatusRejected = "Отклонено"
)
