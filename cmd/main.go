package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"document-approval/api/router"
	"document-approval/pkg/database"
	"document-approval/services/approval"
	"document-approval/services/document"
	"document-approval/services/folder"
	"document-approval/services/storage"
	"document-approval/services/user"

	_ "github.com/lib/pq"
)

func main() {
	// Подключение к БД с отключенным SSL
	db, err := sql.Open("postgres", "postgres://apps:qasw123@localhost:5432/document_approval?sslmode=disable")
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}
	defer db.Close()

	// Проверяем подключение
	if err := db.Ping(); err != nil {
		log.Fatal("Ошибка проверки подключения к БД:", err)
	}

	// Применяем миграции
	migrationsPath := filepath.Join("migrations")
	if err := database.RunMigrations(db, migrationsPath); err != nil {
		log.Fatal("Ошибка применения миграций:", err)
	}

	// Инициализация сервисов
	storageService := storage.NewGlusterStorage("storage/documents")
	userService := user.NewUserService(db)
	documentService := document.NewDocumentService(db, storageService)
	approvalService := approval.NewApprovalService(db)
	folderService := folder.NewFolderService(db, storageService)

	// Создание роутера
	r := router.NewRouter(documentService, userService, approvalService, folderService)

	// Запуск сервера
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Сервер запущен на порту %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
