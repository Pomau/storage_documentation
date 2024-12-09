package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"document-approval/api/response"
	"document-approval/config"
	"document-approval/models"
	"document-approval/services/document"
	"github.com/gorilla/mux"
)

type DocumentHandler struct {
	documentService *document.DocumentService
}

func NewDocumentHandler(documentService *document.DocumentService) *DocumentHandler {
	return &DocumentHandler{
		documentService: documentService,
	}
}

// @Summary Создать документ
// @Description Создает новый документ с возможностью прикрепления файла
// @Tags documents
// @Accept multipart/form-data
// @Produce json
// @Param document formData string true "Метаданные документа в формате JSON"
// @Param file formData file false "Файл документа"
// @Success 200 {object} response.Response{data=models.Document}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security BearerAuth
// @Router /documents [post]
func (h *DocumentHandler) CreateDocument(w http.ResponseWriter, r *http.Request) {
	// Устанавливаем максимальный размер файла (10MB)
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

	// Получаем JSON данные документа
	var doc models.Document
	if err := json.Unmarshal([]byte(r.FormValue("document")), &doc); err != nil {
		response.Error(w, http.StatusBadRequest, "Ошибка парсинга данных документа")
		return
	}

	// Создаем документ
	if err := h.documentService.CreateDocument(&doc, file, header.Filename); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, doc)
}

// @Summary Поиск документов
// @Description Поиск документов по параметрам
// @Tags documents
// @Accept json
// @Produce json
// @Param q query string false "Поисковый запрос"
// @Success 200 {object} response.Response{data=[]models.Document}
// @Failure 401 {object} response.Response
// @Security BearerAuth
// @Router /documents/search [get]
func (h *DocumentHandler) SearchDocuments(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	// Парсим фильтры
	filters := make(map[string]interface{})
	for key, values := range r.URL.Query() {
		if key != "q" && len(values) > 0 {
			filters[key] = values[0]
		}
	}

	// Ищем документы
	docs, err := h.documentService.SearchDocuments(query, filters)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, docs)
}

func (h *DocumentHandler) StartApprovalProcess(w http.ResponseWriter, r *http.Request) {
	var req struct {
		DocumentID  int64   `json:"document_id"`
		ApproverIDs []int64 `json:"approver_ids"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Ошибка парсинга запроса")
		return
	}

	if err := h.documentService.StartApprovalProcess(req.DocumentID, req.ApproverIDs); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, nil)
}

func (h *DocumentHandler) ApproveDocument(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProcessID int64  `json:"process_id"`
		Approved  bool   `json:"approved"`
		Comment   string `json:"comment"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Ошибка парсинга запроса")
		return
	}

	if err := h.documentService.ApproveDocument(req.ProcessID, 1, req.Approved, req.Comment); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, nil)
}

// @Summary Получить документ
// @Description Получает документ по ID
// @Tags documents
// @Produce json
// @Param id path integer true "ID документа"
// @Success 200 {object} response.Response{data=models.Document}
// @Router /documents/{id} [get]
func (h *DocumentHandler) GetDocument(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID документа")
		return
	}

	log.Printf("Получение документа с ID: %d", id)

	doc, err := h.documentService.GetDocument(id)
	if err != nil {
		log.Printf("Ошибка получения документа: %v", err)
		if err.Error() == "документ не найден" {
			response.Error(w, http.StatusNotFound, "Документ не найден")
			return
		}
		response.Error(w, http.StatusInternalServerError, "Ошибка получения документа")
		return
	}

	log.Printf("Документ найден: %+v", doc)
	response.Success(w, doc)
}

// @Summary Обновить документ
// @Description Обновляет документ по ID
// @Tags documents
// @Accept json
// @Produce json
// @Param id path integer true "ID документа"
// @Param document body models.Document true "Данные документа"
// @Success 200 {object} response.Response{data=models.Document}
// @Router /documents/{id} [put]
func (h *DocumentHandler) UpdateDocument(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный ID документа")
		return
	}

	var req struct {
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

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат данных")
		return
	}

	// Парсим даты
	receiptDate, err := time.Parse("2006-01-02", req.ReceiptDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат даты поступления")
		return
	}

	deadlineDate, err := time.Parse("2006-01-02", req.DeadlineDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Неверный формат срока исполнения")
		return
	}

	// Проверяем существование типа документа
	var validType bool
	for _, docType := range config.DocumentTypes {
		if docType.ID == req.DocumentType {
			validType = true
			break
		}
	}
	if !validType {
		response.Error(w, http.StatusBadRequest, "Неверный тип документа")
		return
	}

	doc := &models.Document{
		ID:             id,
		Title:          req.Title,
		ReceiptDate:    receiptDate,
		DeadlineDate:   deadlineDate,
		IncomingNumber: req.IncomingNumber,
		ContactPerson:  req.ContactPerson,
		Kopuk:          req.Kopuk,
		MuseumName:     req.MuseumName,
		Founder:        req.Founder,
		FounderINN:     req.FounderINN,
		DocumentType:   req.DocumentType,
		Metadata:       req.Metadata,
	}

	updatedDoc, err := h.documentService.UpdateDocument(doc)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, updatedDoc)
}

func (h *DocumentHandler) GetDocumentTypes(w http.ResponseWriter, r *http.Request) {
	log.Printf("Получение типов документов")
	log.Printf("Доступные типы: %+v", config.DocumentTypes)
	response.Success(w, config.DocumentTypes)
}
