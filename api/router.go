package api

import (
	"net/http"

	"document-approval/api/handlers"

	"github.com/gorilla/mux"
)

func NewRouter(approvalHandler *handlers.ApprovalHandler) *mux.Router {
	r := mux.NewRouter()

	// Роуты для процессов утверждения (без авторизации)
	r.HandleFunc("/api/approvals", approvalHandler.GetApprovals).Methods("GET")
	r.HandleFunc("/api/documents/{id}/approve", approvalHandler.StartApprovalProcess).Methods("POST")
	r.HandleFunc("/api/approvals/{id}/approve", approvalHandler.ApproveDocument).Methods("POST")

	return r
}
