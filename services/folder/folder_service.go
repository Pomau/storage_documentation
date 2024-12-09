package folder

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"strings"

	"document-approval/models"
	"document-approval/services/storage"
)

type FolderService struct {
	db      *sql.DB
	storage storage.StorageService
}

func NewFolderService(db *sql.DB, storage storage.StorageService) *FolderService {
	return &FolderService{
		db:      db,
		storage: storage,
	}
}

func (s *FolderService) CreateFolder(name string, parentID *int64) (*models.Folder, error) {
	var folder models.Folder
	var parentPath string

	if parentID != nil {
		// Получаем путь родительской папки
		err := s.db.QueryRow(`
            SELECT path FROM folders WHERE id = $1
        `, *parentID).Scan(&parentPath)
		if err != nil {
			return nil, fmt.Errorf("ошибка получения родительской папки: %w", err)
		}
	}

	// Создаем новый путь
	path := filepath.Join(parentPath, name)

	err := s.db.QueryRow(`
        INSERT INTO folders (name, parent_id, path)
        VALUES ($1, $2, $3)
        RETURNING id, name, parent_id, path, created_at
    `, name, parentID, path).Scan(
		&folder.ID, &folder.Name, &folder.ParentID,
		&folder.Path, &folder.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("ошибка создания папки: %w", err)
	}

	return &folder, nil
}

func (s *FolderService) GetFolderTree() ([]models.FolderNode, error) {
	log.Printf("Начинаем получение дерева папок")

	rows, err := s.db.Query(`
        SELECT id, name, parent_id, path, created_at
        FROM folders
        ORDER BY COALESCE(parent_id, 0), path
    `)
	if err != nil {
		log.Printf("Ошибка запроса папок: %v", err)
		return nil, fmt.Errorf("ошибка получения папок: %w", err)
	}
	defer rows.Close()

	folderMap := make(map[int64]*models.FolderNode)
	var rootNodes []*models.FolderNode

	log.Printf("Начинаем чтение папок")

	for rows.Next() {
		node := &models.FolderNode{
			Children: make([]*models.FolderNode, 0),
			Files:    make([]models.Document, 0),
		}

		err := rows.Scan(
			&node.ID,
			&node.Name,
			&node.ParentID,
			&node.Path,
			&node.CreatedAt,
		)
		if err != nil {
			log.Printf("Ошибка сканирования: %v", err)
			return nil, fmt.Errorf("ошибка сканирования папки: %w", err)
		}

		log.Printf("Прочитана папка: ID=%d, Name=%s, ParentID=%v",
			node.ID, node.Name, node.ParentID)

		folderMap[node.ID] = node

		if node.ParentID == nil {
			log.Printf("Добавляем корневую папку: %d", node.ID)
			rootNodes = append(rootNodes, node)
		} else {
			if parent, ok := folderMap[*node.ParentID]; ok {
				log.Printf("Добавляем папку %d к родителю %d", node.ID, *node.ParentID)
				parent.Children = append(parent.Children, node)
			} else {
				log.Printf("Не найден родитель %d для папки %d", *node.ParentID, node.ID)
			}
		}
	}

	// Получаем документы для каждой папки
	for _, node := range folderMap {
		docs, err := s.getDocumentsForFolder(node.ID)
		if err != nil {
			return nil, fmt.Errorf("ошибка получения документов для папки %d: %w", node.ID, err)
		}
		node.Files = docs
	}

	log.Printf("Построенное дерево:")
	for _, root := range rootNodes {
		printTree(root, 0)
	}

	// Преобразуем указатели в значения для ответа
	result := make([]models.FolderNode, len(rootNodes))
	for i, node := range rootNodes {
		result[i] = *node
	}

	return result, nil
}

func printTree(node *models.FolderNode, level int) {
	indent := strings.Repeat("  ", level)
	log.Printf("%sID=%d, Name=%s, Children=%d",
		indent, node.ID, node.Name, len(node.Children))
	for _, child := range node.Children {
		printTree(child, level+1)
	}
}

func (s *FolderService) getDocumentsForFolder(folderID int64) ([]models.Document, error) {
	rows, err := s.db.Query(`
        SELECT 
            d.id, d.title, d.receipt_date, d.deadline_date, 
            d.completion_date, d.incoming_number, d.contact_person,
            d.kopuk, d.museum_name, d.founder, d.founder_inn,
            d.status, d.file_path, d.created_at
        FROM documents d
        JOIN folder_documents fd ON d.id = fd.document_id
        WHERE fd.folder_id = $1
        ORDER BY d.created_at DESC
    `, folderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []models.Document
	for rows.Next() {
		var doc models.Document
		err := rows.Scan(
			&doc.ID, &doc.Title, &doc.ReceiptDate, &doc.DeadlineDate,
			&doc.CompletionDate, &doc.IncomingNumber, &doc.ContactPerson,
			&doc.Kopuk, &doc.MuseumName, &doc.Founder, &doc.FounderINN,
			&doc.Status, &doc.FilePath, &doc.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}

	return docs, nil
}

func (s *FolderService) RenameFolder(id int64, newName string) error {
	_, err := s.db.Exec(`
        UPDATE folders
        SET name = $1
        WHERE id = $2
    `, newName, id)

	if err != nil {
		return fmt.Errorf("ошибка переименования папки: %w", err)
	}

	return nil
}

func (s *FolderService) DeleteFolder(id int64) error {
	_, err := s.db.Exec(`
        DELETE FROM folders
        WHERE id = $1
    `, id)

	if err != nil {
		return fmt.Errorf("ошибка удаления папки: %w", err)
	}

	return nil
}

func (s *FolderService) GetFolderByID(id int64) (*models.Folder, error) {
	var folder models.Folder
	err := s.db.QueryRow(`
        SELECT id, name, parent_id, path, created_at
        FROM folders WHERE id = $1
    `, id).Scan(
		&folder.ID, &folder.Name, &folder.ParentID,
		&folder.Path, &folder.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("папка не найдена")
	}
	if err != nil {
		return nil, fmt.Errorf("ошибка получения папки: %w", err)
	}

	return &folder, nil
}

func (s *FolderService) SaveFile(doc *models.Document, file io.Reader) error {
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

	// Извлекаем текст из файла
	fileContent, err := s.storage.ExtractText(filePath)
	if err != nil {
		// Логируем ошибку, но продолжаем выполнение
		log.Printf("ошибка извлечения текста из файла: %v", err)
	}

	// Преобразуем metadata в JSON
	metadataJSON, err := json.Marshal(doc.Metadata)
	if err != nil {
		return fmt.Errorf("ошибка сериализации метаданных: %w", err)
	}

	// Сохраняем документ в БД с привязкой к папке
	err = tx.QueryRow(`
        WITH inserted_doc AS (
            INSERT INTO documents (
                title, receipt_date, deadline_date, incoming_number,
                contact_person, kopuk, museum_name, founder,
                founder_inn, status, file_path, document_type, metadata,
                file_content
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14
            )
            RETURNING id, created_at
        )
        INSERT INTO folder_documents (folder_id, document_id)
        SELECT $15, id FROM inserted_doc
        RETURNING (SELECT id FROM inserted_doc), (SELECT created_at FROM inserted_doc)
    `,
		doc.Title, doc.ReceiptDate, doc.DeadlineDate,
		doc.IncomingNumber, doc.ContactPerson, doc.Kopuk,
		doc.MuseumName, doc.Founder, doc.FounderINN,
		doc.Status, doc.FilePath, doc.DocumentType, metadataJSON,
		fileContent, doc.FolderID,
	).Scan(&doc.ID, &doc.CreatedAt)

	if err != nil {
		return fmt.Errorf("ошибка сохранения документа: %w", err)
	}

	return tx.Commit()
}

func (s *FolderService) GetFile(fileID int64) (*models.Document, io.ReadCloser, error) {
	var doc models.Document
	err := s.db.QueryRow(`
        SELECT id, title, file_path FROM documents WHERE id = $1
    `, fileID).Scan(&doc.ID, &doc.Title, &doc.FilePath)

	if err != nil {
		return nil, nil, fmt.Errorf("ошибка получения документа: %w", err)
	}

	file, err := s.storage.GetFile(doc.FilePath)
	if err != nil {
		return nil, nil, fmt.Errorf("ошибка получения файла: %w", err)
	}

	return &doc, file, nil
}
