package approval

import (
	"database/sql"
	"fmt"
	"time"

	"document-approval/models"
)

type ApprovalService struct {
	db *sql.DB
}

func NewApprovalService(db *sql.DB) *ApprovalService {
	return &ApprovalService{db: db}
}

func (s *ApprovalService) GetUserApprovals(userId int64, status string) ([]models.ApprovalProcess, error) {
	query := `
        SELECT ap.id, ap.document_id, ap.status, ap.created_at,
               d.title, d.museum_name, d.file_path
        FROM approval_processes ap
        JOIN documents d ON d.id = ap.document_id
        JOIN approvers a ON a.process_id = ap.id
        WHERE a.user_id = $1
    `

	if status == "pending" {
		query += " AND a.status = 'Ожидает'"
	} else {
		query += " AND a.status IN ('Утверждено', 'Отклонено')"
	}

	rows, err := s.db.Query(query, userId)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения согласований: %w", err)
	}
	defer rows.Close()

	var processes []models.ApprovalProcess
	for rows.Next() {
		var p models.ApprovalProcess
		var d models.Document

		err := rows.Scan(
			&p.ID, &p.DocumentID, &p.Status, &p.CreatedAt,
			&d.Title, &d.MuseumName, &d.FilePath,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования результатов: %w", err)
		}

		// Получаем утверждающих для процесса
		approvers, err := s.getProcessApprovers(p.ID)
		if err != nil {
			return nil, err
		}

		p.Document = &d
		p.Approvers = approvers
		processes = append(processes, p)
	}

	return processes, nil
}

func (s *ApprovalService) getProcessApprovers(processId int64) ([]models.Approver, error) {
	query := `
        SELECT a.id, a.user_id, a.status, a.comment, a.approved_at,
               u.first_name, u.last_name
        FROM approvers a
        JOIN users u ON u.id = a.user_id
        WHERE a.process_id = $1
        ORDER BY a.id
    `

	rows, err := s.db.Query(query, processId)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения утверждающих: %w", err)
	}
	defer rows.Close()

	var approvers []models.Approver
	for rows.Next() {
		var a models.Approver
		var u models.User

		err := rows.Scan(
			&a.ID, &a.UserID, &a.Status, &a.Comment, &a.ApprovedAt,
			&u.FirstName, &u.LastName,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования утверждающего: %w", err)
		}

		a.User = &u
		approvers = append(approvers, a)
	}

	return approvers, nil
}

func (s *ApprovalService) GetApprovalDetails(processId int64) (*models.ApprovalProcess, error) {
	query := `
        SELECT ap.id, ap.document_id, ap.status, ap.created_at,
               d.title, d.museum_name, d.file_path
        FROM approval_processes ap
        JOIN documents d ON d.id = ap.document_id
        WHERE ap.id = $1
    `

	var p models.ApprovalProcess
	var d models.Document

	err := s.db.QueryRow(query, processId).Scan(
		&p.ID, &p.DocumentID, &p.Status, &p.CreatedAt,
		&d.Title, &d.MuseumName, &d.FilePath,
	)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения процесса: %w", err)
	}

	approvers, err := s.getProcessApprovers(processId)
	if err != nil {
		return nil, err
	}

	p.Document = &d
	p.Approvers = approvers

	return &p, nil
}

func (s *ApprovalService) GetApprovalProcesses() ([]models.ApprovalProcess, error) {
	query := `
        SELECT 
            ap.id, ap.document_id, ap.status, ap.created_at,
            d.title, d.status as document_status
        FROM approval_processes ap
        JOIN documents d ON ap.document_id = d.id
        ORDER BY ap.created_at DESC
    `

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("ошибка получения процессов: %w", err)
	}
	defer rows.Close()

	var processes []models.ApprovalProcess
	for rows.Next() {
		var p models.ApprovalProcess
		var d models.Document
		err := rows.Scan(
			&p.ID, &d.ID, &p.Status, &p.CreatedAt,
			&d.Title, &d.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования результатов: %w", err)
		}
		p.Document = &d
		processes = append(processes, p)
	}

	return processes, nil
}

func (s *ApprovalService) StartApprovalProcess(documentID int64, approverIDs []int64) error {
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("ошибка начала транзакции: %w", err)
	}
	defer tx.Rollback()

	// Создаем процесс утверждения
	var processID int64
	err = tx.QueryRow(`
        INSERT INTO approval_processes (document_id, status, created_at)
        VALUES ($1, 'В процессе', $2)
        RETURNING id
    `, documentID, time.Now()).Scan(&processID)

	if err != nil {
		return fmt.Errorf("ошибка создания процесса: %w", err)
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
        UPDATE documents SET status = 'На утверждении'
        WHERE id = $1
    `, documentID)

	if err != nil {
		return fmt.Errorf("ошибка обновления статуса документа: %w", err)
	}

	return tx.Commit()
}

func (s *ApprovalService) ApproveDocument(processID int64, userID int64, approved bool, comment string) error {
	// Начинаем транзакцию
	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("ошибка начала транзакции: %w", err)
	}
	defer tx.Rollback()

	// Проверяем, что пользователь является утверждающим для данного процесса
	var exists bool
	err = tx.QueryRow(`
        SELECT EXISTS (
            SELECT 1 FROM approvers 
            WHERE process_id = $1 AND user_id = $2 AND status = 'Ожидает'
        )
    `, processID, userID).Scan(&exists)

	if err != nil {
		return fmt.Errorf("ошибка проверки прав пользователя: %w", err)
	}

	if !exists {
		return fmt.Errorf("пользователь не имеет прав на утверждение")
	}

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
		return fmt.Errorf("ошибка проверки статусов: %w", err)
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
