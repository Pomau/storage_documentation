package router

import (
	"document-approval/api/handlers"
	_ "document-approval/docs"
	"document-approval/middleware"
	"document-approval/services/approval"
	"document-approval/services/document"
	"document-approval/services/folder"
	"document-approval/services/user"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

func NewRouter(
	documentService *document.DocumentService,
	userService *user.UserService,
	approvalService *approval.ApprovalService,
	folderService *folder.FolderService,
) *mux.Router {
	r := mux.NewRouter()

	// Добавляем CORS middleware
	r.Use(middleware.CORS)

	// Swagger UI
	r.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
		httpSwagger.DeepLinking(true),
	))

	// Хендлеры
	docHandler := handlers.NewDocumentHandler(documentService)
	approvalHandler := handlers.NewApprovalHandler(approvalService)
	folderHandler := handlers.NewFolderHandler(folderService)

	api := r.PathPrefix("/api").Subrouter()

	// Папки
	api.HandleFunc("/folders/tree", folderHandler.GetFolderTree).Methods("GET", "OPTIONS")
	api.HandleFunc("/folders", folderHandler.CreateFolder).Methods("POST", "OPTIONS")
	api.HandleFunc("/folders/{id}", folderHandler.RenameFolder).Methods("PUT", "OPTIONS")
	api.HandleFunc("/folders/{id}", folderHandler.DeleteFolder).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/folders/{id}/files", folderHandler.UploadFile).Methods("POST", "OPTIONS")

	// Файлы
	api.HandleFunc("/files/{id}/download", folderHandler.DownloadFile).Methods("GET", "OPTIONS")

	// Документы
	api.HandleFunc("/documents/types", docHandler.GetDocumentTypes).Methods("GET", "OPTIONS")
	api.HandleFunc("/documents/search", docHandler.SearchDocuments).Methods("GET", "OPTIONS")
	api.HandleFunc("/documents/approve/start", docHandler.StartApprovalProcess).Methods("POST", "OPTIONS")
	api.HandleFunc("/documents/approve", docHandler.ApproveDocument).Methods("POST", "OPTIONS")
	api.HandleFunc("/documents/{id}", docHandler.GetDocument).Methods("GET", "OPTIONS")
	api.HandleFunc("/documents/{id}", docHandler.UpdateDocument).Methods("PUT", "OPTIONS")
	api.HandleFunc("/documents", docHandler.CreateDocument).Methods("POST", "OPTIONS")

	// Согласования
	api.HandleFunc("/approvals", approvalHandler.GetApprovals).Methods("GET", "OPTIONS")
	api.HandleFunc("/documents/{id}/approve", approvalHandler.StartApprovalProcess).Methods("POST", "OPTIONS")
	api.HandleFunc("/approvals/{id}/approve", approvalHandler.ApproveDocument).Methods("POST", "OPTIONS")

	return r
}
