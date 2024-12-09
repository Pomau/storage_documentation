package document

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"

	"document-approval/models"
	"document-approval/services/storage"
)

type DocumentService struct {
	db      *sql.DB
	storage storage.StorageService
}

func NewDocumentService(db *sql.DB, storage storage.StorageService) *DocumentService {
	return &DocumentService{
		db:      db,
		storage: storage,
	}
}

func (s *DocumentService) CreateDocument(doc *models.Document, file io.Reader, filename string) error {
	// Валидация обязательных полей
	if err := s.validateDocument(doc); err != nil {
		return err
	}

	// Сохраняем файл если есть
	var filePath string
	var fileContent string
	var err error
	if file != nil {
		filePath, err = s.storage.SaveFile(file, filename)
		if err != nil {
			return fmt.Errorf("ошибка сохранения файла: %w", err)
		}

		// Извлекаем текст из файла
		fileContent, err = s.storage.ExtractText(filePath)
		if err != nil {
			// Логируем ошибку, но продолжаем выполнение
			log.Printf("ошибка извлечения текста из файла: %v", err)
		}
	}

	// Если метаданные не указаны, используем пустой объект
	if doc.Metadata == nil {
		doc.Metadata = make(map[string]interface{})
	}

	// Преобразуем метаданные в JSON
	metadataJSON, err := json.Marshal(doc.Metadata)
	if err != nil {
		return fmt.Errorf("ошибка сериализации метаданных: %w", err)
	}

	// Сохраняем документ в БД
	query := `
        INSERT INTO documents (
            title, receipt_date, deadline_date, incoming_number,
            contact_person, kopuk, museum_name, founder, 
            founder_inn, file_path, status, document_type, metadata,
            file_content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
    `

	err = s.db.QueryRow(
		query,
		doc.Title,
		doc.ReceiptDate,
		doc.DeadlineDate,
		doc.IncomingNumber,
		doc.ContactPerson,
		doc.Kopuk,
		doc.MuseumName,
		doc.Founder,
		doc.FounderINN,
		filePath,
		"Черновик",
		doc.DocumentType,
		metadataJSON,
		fileContent,
	).Scan(&doc.ID)

	if err != nil {
		return fmt.Errorf("ошибка сохранения документа: %w", err)
	}

	return nil
}

func (s *DocumentService) validateDocument(doc *models.Document) error {
	if doc.Title == "" {
		return fmt.Errorf("заголовок документа обязателен")
	}

	innRegex := regexp.MustCompile(`^\d{10}(\d{2})?$`)
	if !innRegex.MatchString(doc.FounderINN) {
		return fmt.Errorf("неверный формат ИНН")
	}

	// Другие проверки...

	return nil
}

func (s *DocumentService) SearchDocuments(query string, filters map[string]interface{}) ([]models.Document, error) {
	baseQuery := `
        WITH search_query AS (
            SELECT CASE 
                WHEN $1 = '' THEN NULL
                ELSE to_tsquery('russian', array_to_string(array_agg(lexeme), ' & '))
            END as query
            FROM unnest(array(
                SELECT lower(lexeme) FROM unnest(to_tsvector('russian', $1)) as lexeme
            )) as lexeme
        ),
        ranked_docs AS (
            SELECT 
                d.id, d.title, d.receipt_date, d.deadline_date, d.completion_date,
                d.incoming_number, d.contact_person, d.kopuk, d.museum_name,
                d.founder, d.founder_inn, d.status, d.file_path, d.created_at,
                d.document_type, d.metadata, d.file_content,
                CASE 
                    WHEN $1 = '' THEN 0
                    ELSE ts_rank_cd(d.search_vector, query, 32)
                END as rank
            FROM documents d, search_query
            WHERE 1=1
    `
	params := []interface{}{query}
	paramCount := 2

	// Если есть поисковый запрос, добавляем условие поиска
	if query != "" {
		baseQuery += ` AND (
            d.search_vector @@ query
            OR lower(d.title) LIKE lower('%' || $1 || '%')
            OR lower(d.museum_name) LIKE lower('%' || $1 || '%')
            OR lower(d.founder) LIKE lower('%' || $1 || '%')
            OR lower(d.contact_person) LIKE lower('%' || $1 || '%')
            OR lower(d.file_content) LIKE lower('%' || $1 || '%')
        )`
	}

	// Добавляем фильтры
	for key, value := range filters {
		switch key {
		case "status":
			statuses := strings.Split(value.(string), ",")
			placeholders := make([]string, len(statuses))
			for i, _ := range statuses {
				placeholders[i] = fmt.Sprintf("$%d", paramCount)
				params = append(params, statuses[i])
				paramCount++
			}
			baseQuery += fmt.Sprintf(" AND status = ANY(ARRAY[%s])", strings.Join(placeholders, ","))
		case "document_type":
			types := strings.Split(value.(string), ",")
			placeholders := make([]string, len(types))
			for i, _ := range types {
				placeholders[i] = fmt.Sprintf("$%d", paramCount)
				params = append(params, types[i])
				paramCount++
			}
			baseQuery += fmt.Sprintf(" AND document_type = ANY(ARRAY[%s])", strings.Join(placeholders, ","))
		case "date_from":
			baseQuery += fmt.Sprintf(" AND receipt_date >= $%d", paramCount)
			params = append(params, value)
			paramCount++
		case "date_to":
			baseQuery += fmt.Sprintf(" AND receipt_date <= $%d", paramCount)
			params = append(params, value)
			paramCount++
		}
	}

	baseQuery += `
        )
        SELECT * FROM ranked_docs
        ORDER BY rank DESC, created_at DESC
    `

	rows, err := s.db.Query(baseQuery, params...)
	if err != nil {
		return nil, fmt.Errorf("ошибка поиска документов: %w", err)
	}
	defer rows.Close()

	var documents []models.Document
	for rows.Next() {
		var doc models.Document
		var metadataBytes []byte
		var rank float64

		err := rows.Scan(
			&doc.ID, &doc.Title, &doc.ReceiptDate, &doc.DeadlineDate,
			&doc.CompletionDate, &doc.IncomingNumber, &doc.ContactPerson,
			&doc.Kopuk, &doc.MuseumName, &doc.Founder, &doc.FounderINN,
			&doc.Status, &doc.FilePath, &doc.CreatedAt,
			&doc.DocumentType, &metadataBytes, &doc.FileContent, &rank,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования результатов: %w", err)
		}

		// Преобразуем JSON в map
		if metadataBytes != nil {
			var metadata map[string]interface{}
			if err := json.Unmarshal(metadataBytes, &metadata); err != nil {
				return nil, fmt.Errorf("ошибка десериализации метаданных: %w", err)
			}
			doc.Metadata = metadata
		} else {
			doc.Metadata = make(map[string]interface{})
		}

		documents = append(documents, doc)
	}

	return documents, nil
}

func (s *DocumentService) StartApprovalProcess(documentID int64, approverIDs []int64) error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("ошибка начала транзакции: %w", err)
	}
	defer tx.Rollback()

	// Создаем процесс утверждения
	var processID int64
	err = tx.QueryRow(`
        INSERT INTO approval_processes (document_id, status)
        VALUES ($1, 'В процессе')
        RETURNING id
    `, documentID).Scan(&processID)

	if err != nil {
		return fmt.Errorf("ошибка создания процесса утверждения: %w", err)
	}

	// Добавляем утверждающих
	for _, approverID := range approverIDs {
		_, err = tx.Exec(`
            INSERT INTO approvers (process_id, user_id, status)
            VALUES ($1, $2, 'Ожидает')
        `, processID, approverID)

		if err != nil {
			return fmt.Errorf("ошибка добавления утверждающего: %w", err)
		}
	}

	// Обновляем статус документа
	_, err = tx.Exec(`
        UPDATE documents 
        SET status = 'Рассматривается'
        WHERE id = $1
    `, documentID)

	if err != nil {
		return fmt.Errorf("ошибка обновления статуса документа: %w", err)
	}

	return tx.Commit()
}

func (s *DocumentService) ApproveDocument(processID int64, userID int64, approved bool, comment string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("ошибка начала транзакции: %w", err)
	}
	defer tx.Rollback()

	// Обновляем статус утверждающего
	status := "Утверждено"
	if !approved {
		status = "Отклонено"
	}

	_, err = tx.Exec(`
        UPDATE approvers
        SET status = $1, comment = $2, approved_at = CURRENT_TIMESTAMP
        WHERE process_id = $3 AND user_id = $4
    `, status, comment, processID, userID)

	if err != nil {
		return fmt.Errorf("ошибка обновления статуса утверждающего: %w", err)
	}

	// Проверяем, все ли утвердили документ
	var allApproved bool
	err = tx.QueryRow(`
        SELECT NOT EXISTS (
            SELECT 1 FROM approvers 
            WHERE process_id = $1 AND status = 'Ожидает'
        )
    `, processID).Scan(&allApproved)

	if err != nil {
		return fmt.Errorf("ошибка проверки статусов утверждающих: %w", err)
	}

	if allApproved {
		// Проверяем, есть ли отклонения
		var hasRejections bool
		err = tx.QueryRow(`
            SELECT EXISTS (
                SELECT 1 FROM approvers 
                WHERE process_id = $1 AND status = 'Отклонено'
            )
        `, processID).Scan(&hasRejections)

		if err != nil {
			return fmt.Errorf("ошибка проверки отклонений: %w", err)
		}

		// Обновляем статус процесса и документа
		finalStatus := "Утвержден"
		if hasRejections {
			finalStatus = "Отклонен"
		}

		_, err = tx.Exec(`
            UPDATE approval_processes
            SET status = 'Завершен'
            WHERE id = $1
        `, processID)

		if err != nil {
			return fmt.Errorf("ошибка обновления статуса процесса: %w", err)
		}

		_, err = tx.Exec(`
            UPDATE documents d
            SET status = $1
            FROM approval_processes ap
            WHERE ap.id = $2 AND ap.document_id = d.id
        `, finalStatus, processID)

		if err != nil {
			return fmt.Errorf("ошибка обновления статуса документа: %w", err)
		}
	}

	return tx.Commit()
}

func (s *DocumentService) GetDocument(id int64) (*models.Document, error) {
	var doc models.Document
	var metadataBytes []byte
	var documentType sql.NullString

	err := s.db.QueryRow(`
        SELECT 
            d.id, d.title, d.receipt_date, d.deadline_date, d.completion_date,
            d.incoming_number, d.contact_person, d.kopuk, d.museum_name,
            d.founder, d.founder_inn, d.status, d.file_path, d.created_at,
            d.document_type, d.metadata
        FROM documents d
        LEFT JOIN folder_documents fd ON d.id = fd.document_id
        WHERE d.id = $1
    `, id).Scan(
		&doc.ID, &doc.Title, &doc.ReceiptDate, &doc.DeadlineDate,
		&doc.CompletionDate, &doc.IncomingNumber, &doc.ContactPerson,
		&doc.Kopuk, &doc.MuseumName, &doc.Founder, &doc.FounderINN,
		&doc.Status, &doc.FilePath, &doc.CreatedAt,
		&documentType, &metadataBytes,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("документ не найден")
	}
	if err != nil {
		return nil, fmt.Errorf("ошибка получения документа: %w", err)
	}

	// Устанавливаем значение document_type
	if documentType.Valid {
		doc.DocumentType = documentType.String
	}

	// Преобразуем JSON в map
	if metadataBytes != nil {
		var metadata map[string]interface{}
		if err := json.Unmarshal(metadataBytes, &metadata); err != nil {
			return nil, fmt.Errorf("ошибка десериализации метаданных: %w", err)
		}
		doc.Metadata = metadata
	} else {
		doc.Metadata = make(map[string]interface{})
	}

	return &doc, nil
}

func (s *DocumentService) UpdateDocument(doc *models.Document) (*models.Document, error) {
	// Преобразуем map в JSON для metadata
	metadataJSON, err := json.Marshal(doc.Metadata)
	if err != nil {
		return nil, fmt.Errorf("ошибка сериализации метаданных: %w", err)
	}

	// Временная переменная для хранения JSON метаданных
	var metadataBytes []byte

	err = s.db.QueryRow(`
        UPDATE documents SET
            title = $1,
            receipt_date = $2,
            deadline_date = $3,
            incoming_number = $4,
            contact_person = $5,
            kopuk = $6,
            museum_name = $7,
            founder = $8,
            founder_inn = $9,
            document_type = $10,
            metadata = $11::jsonb
        WHERE id = $12
        RETURNING 
            id, title, receipt_date, deadline_date, completion_date,
            incoming_number, contact_person, kopuk, museum_name,
            founder, founder_inn, status, file_path, created_at,
            document_type, metadata
    `,
		doc.Title, doc.ReceiptDate, doc.DeadlineDate,
		doc.IncomingNumber, doc.ContactPerson, doc.Kopuk,
		doc.MuseumName, doc.Founder, doc.FounderINN,
		doc.DocumentType, metadataJSON, doc.ID,
	).Scan(
		&doc.ID, &doc.Title, &doc.ReceiptDate, &doc.DeadlineDate,
		&doc.CompletionDate, &doc.IncomingNumber, &doc.ContactPerson,
		&doc.Kopuk, &doc.MuseumName, &doc.Founder, &doc.FounderINN,
		&doc.Status, &doc.FilePath, &doc.CreatedAt,
		&doc.DocumentType, &metadataBytes,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("документ не найден")
	}
	if err != nil {
		return nil, fmt.Errorf("ошибка обновления документа: %w", err)
	}

	// Преобразуем JSON обратно в map
	if metadataBytes != nil {
		var metadata map[string]interface{}
		if err := json.Unmarshal(metadataBytes, &metadata); err != nil {
			return nil, fmt.Errorf("ошибка десериализации метаданных: %w", err)
		}
		doc.Metadata = metadata
	}

	return doc, nil
}

func (s *DocumentService) SaveFile(doc *models.Document, file io.Reader) error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("ошибка начала транзакции: %w", err)
	}
	defer tx.Rollback()

	// Сохраняем файл
	filePath, err := s.storage.SaveFile(file, doc.FilePath)
	if err != nil {
		return fmt.Errorf("ошибка сохранения файла: %w", err)
	}

	// Обновляем путь к файлу после сохранения
	doc.FilePath = filePath

	// Сохраняем документ в БД с привязкой к папке
	err = tx.QueryRow(`
        WITH inserted_doc AS (
            INSERT INTO documents (
                title, receipt_date, deadline_date, incoming_number,
                contact_person, kopuk, museum_name, founder,
                founder_inn, status, file_path, document_type, metadata
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING id, created_at
        )
        INSERT INTO folder_documents (folder_id, document_id)
        SELECT $14, id FROM inserted_doc
        RETURNING (SELECT id FROM inserted_doc), (SELECT created_at FROM inserted_doc)
    `,
		doc.Title, doc.ReceiptDate, doc.DeadlineDate,
		doc.IncomingNumber, doc.ContactPerson, doc.Kopuk,
		doc.MuseumName, doc.Founder, doc.FounderINN,
		doc.Status, doc.FilePath, doc.DocumentType, doc.Metadata,
		doc.FolderID,
	).Scan(&doc.ID, &doc.CreatedAt)

	if err != nil {
		return fmt.Errorf("ошибка сохранения документа: %w", err)
	}

	return tx.Commit()
}
