package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"document-approval/api/response"
	"document-approval/services/approval"

	"github.com/gorilla/mux"
)

type ApprovalHandler struct {
	approvalService *approval.ApprovalService
}

func NewApprovalHandler(approvalService *approval.ApprovalService) *ApprovalHandler {
	return &ApprovalHandler{
		approvalService: approvalService,
	}
}

// GetApprovals возвращает список процессов утверждения
func (h *ApprovalHandler) GetApprovals(w http.ResponseWriter, r *http.Request) {
	processes, err := h.approvalService.GetApprovalProcesses()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, processes)
}

// StartApprovalProcess запускает процесс утверждения
func (h *ApprovalHandler) StartApprovalProcess(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ApproverIds []int64 `json:"approverIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат запроса")
		return
	}

	vars := mux.Vars(r)
	documentId, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID документа")
		return
	}

	err = h.approvalService.StartApprovalProcess(documentId, req.ApproverIds)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, nil)
}

// ApproveDocument обрабатывает решение по документу
func (h *ApprovalHandler) ApproveDocument(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Approved bool   `json:"approved"`
		Comment  string `json:"comment"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат запроса")
		return
	}

	vars := mux.Vars(r)
	processId, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID процесса")
		return
	}

	// Для демонстрации используем фиктивный ID пользователя
	userId := int64(1)

	err = h.approvalService.ApproveDocument(processId, userId, req.Approved, req.Comment)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, nil)
}

// GetUserApprovals возвращает список согласований для пользователя
func (h *ApprovalHandler) GetUserApprovals(w http.ResponseWriter, r *http.Request) {
	// Для демонстрации используем фиктивный ID пользователя
	userID := int64(1)
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "pending"
	}

	processes, err := h.approvalService.GetUserApprovals(userID, status)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, processes)
}

// GetApprovalDetails возвращает детали процесса согласования
func (h *ApprovalHandler) GetApprovalDetails(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	processID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID процесса")
		return
	}

	process, err := h.approvalService.GetApprovalDetails(processID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, process)
}
