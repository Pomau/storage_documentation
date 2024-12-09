package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"document-approval/api/response"
	"document-approval/models"
	"document-approval/services/folder"

	"github.com/gorilla/mux"
)

type FolderHandler struct {
	folderService *folder.FolderService
}

func NewFolderHandler(folderService *folder.FolderService) *FolderHandler {
	return &FolderHandler{
		folderService: folderService,
	}
}

// @Summary Получить дерево папок
// @Description Получает иерархическую структуру папок и файлов
// @Tags folders
// @Produce json
// @Success 200 {object} response.Response{data=[]models.FolderNode}
// @Router /folders/tree [get]
func (h *FolderHandler) GetFolderTree(w http.ResponseWriter, r *http.Request) {
	tree, err := h.folderService.GetFolderTree()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, tree)
}

// @Summary Создать папку
// @Description Создает новую папку
// @Tags folders
// @Accept json
// @Produce json
// @Param folder body object{name=string,parent_id=integer} true "Данные папки"
// @Success 200 {object} response.Response{data=models.Folder}
// @Router /folders [post]
func (h *FolderHandler) CreateFolder(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		ParentID *int64 `json:"parent_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат запроса")
		return
	}

	folder, err := h.folderService.CreateFolder(req.Name, req.ParentID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, folder)
}

// @Summary Переименовать папку
// @Description Изменяет название папки
// @Tags folders
// @Accept json
// @Produce json
// @Param id path integer true "ID папки"
// @Param folder body object{name=string} true "Новое название"
// @Success 200 {object} response.Response
// @Router /folders/{id} [put]
func (h *FolderHandler) RenameFolder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID папки")
		return
	}

	var req struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат запроса")
		return
	}

	if err := h.folderService.RenameFolder(id, req.Name); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, nil)
}

// @Summary Удалить папку
// @Description Удаляет папку и все её содержимое
// @Tags folders
// @Produce json
// @Param id path integer true "ID папки"
// @Success 200 {object} response.Response
// @Router /folders/{id} [delete]
func (h *FolderHandler) DeleteFolder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID папки")
		return
	}

	if err := h.folderService.DeleteFolder(id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, nil)
}

// @Summary Загрузить файл в папку
// @Description Загружает файл в указанную папку
// @Tags folders
// @Accept multipart/form-data
// @Produce json
// @Param id path integer true "ID папки"
// @Param file formData file true "Файл для загрузки"
// @Param metadata formData string true "Метаданные документа"
// @Success 200 {object} response.Response{data=models.Document}
// @Router /folders/{id}/files [post]
func (h *FolderHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	folderID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		// Если ID папки не указан или неверный, используем корневую папку
		folderID = 1 // ID корневой папки
	}

	// Проверяем существование папки
	folder, err := h.folderService.GetFolderByID(folderID)
	if err != nil {
		response.Error(w, http.StatusNotFound, "Папка не найдена")
		return
	}

	// Парсим multipart форму
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.Error(w, http.StatusBadRequest, "Ошибка парсинга формы")
		return
	}

	// Получаем файл
	file, header, err := r.FormFile("file")
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Ошибка получения файла")
		return
	}
	defer file.Close()

	// Получаем метаданные документа
	type DocumentMetadata struct {
		Title          string         `json:"title"`
		ReceiptDate    string         `json:"receipt_date"`
		DeadlineDate   string         `json:"deadline_date"`
		IncomingNumber string         `json:"incoming_number"`
		ContactPerson  string         `json:"contact_person"`
		Kopuk          int            `json:"kopuk"`
		MuseumName     string         `json:"museum_name"`
		Founder        string         `json:"founder"`
		FounderINN     string         `json:"founder_inn"`
		DocumentType   string         `json:"document_type"`
		Metadata       map[string]any `json:"metadata"`
	}

	var metadata DocumentMetadata
	if err := json.Unmarshal([]byte(r.FormValue("metadata")), &metadata); err != nil {
		response.Error(w, http.StatusBadRequest, "Ошибка парсинга метаданных")
		return
	}

	// Проверяем и устанавливаем пустой объект для metadata
	if metadata.Metadata == nil {
		metadata.Metadata = make(map[string]interface{})
	}

	log.Printf("Получены метаданные: %+v", metadata)
	log.Printf("Парсинг даты поступления: %s", metadata.ReceiptDate)
	log.Printf("Парсинг срока исполнения: %s", metadata.DeadlineDate)

	// Парсим даты
	receiptDate, err := time.Parse("2006-01-02", metadata.ReceiptDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат даты поступления")
		return
	}

	deadlineDate, err := time.Parse("2006-01-02", metadata.DeadlineDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат срока исполнения")
		return
	}

	// Создаем документ
	doc := &models.Document{
		Title:          metadata.Title,
		ReceiptDate:    receiptDate,
		DeadlineDate:   deadlineDate,
		IncomingNumber: metadata.IncomingNumber,
		ContactPerson:  metadata.ContactPerson,
		Kopuk:          metadata.Kopuk,
		MuseumName:     metadata.MuseumName,
		Founder:        metadata.Founder,
		FounderINN:     metadata.FounderINN,
		FilePath:       filepath.Join(folder.Path, header.Filename),
		Status:         "Черновик",
		FolderID:       folderID,
		DocumentType:   metadata.DocumentType,
		Metadata:       metadata.Metadata,
	}

	// Сохраняем файл и создаем документ
	if err := h.folderService.SaveFile(doc, file); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, doc)
}

// @Summary Скачать файл
// @Description Скачивает файл по его ID
// @Tags folders
// @Produce octet-stream
// @Param id path integer true "ID файла"
// @Success 200 {file} binary
// @Router /files/{id}/download [get]
func (h *FolderHandler) DownloadFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID файла")
		return
	}

	doc, file, err := h.folderService.GetFile(fileID)
	if err != nil {
		response.Error(w, http.StatusNotFound, "Файл не найден")
		return
	}
	defer file.Close()

	// Устанавливаем заголовки для скачивания
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filepath.Base(doc.FilePath)))
	w.Header().Set("Content-Type", "application/octet-stream")

	// Копируем файл в ответ
	if _, err := io.Copy(w, file); err != nil {
		log.Printf("Ошибка отправки файла: %v", err)
	}
}
