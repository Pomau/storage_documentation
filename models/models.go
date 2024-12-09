package models

import "time"

type Document struct {
	ID             int64          `json:"id"`
	Title          string         `json:"title"`
	ReceiptDate    time.Time      `json:"receipt_date"`
	DeadlineDate   time.Time      `json:"deadline_date"`
	CompletionDate *time.Time     `json:"completion_date,omitempty"`
	IncomingNumber string         `json:"incoming_number"`
	ContactPerson  string         `json:"contact_person"`
	Kopuk          int            `json:"kopuk"`
	MuseumName     string         `json:"museum_name"`
	Founder        string         `json:"founder"`
	FounderINN     string         `json:"founder_inn"`
	Status         string         `json:"status"`
	FilePath       string         `json:"file_path,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	FolderID       int64          `json:"folder_id"`
	DocumentType   string         `json:"document_type"`
	Metadata       map[string]any `json:"metadata"`

	FileContent string `json:"file_content"`
}

type DocumentType struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Fields      []FieldConfig `json:"fields"`
}

type FieldConfig struct {
	Key        string      `json:"key"`
	Label      string      `json:"label"`
	Type       string      `json:"type"`
	Required   bool        `json:"required"`
	Validation *Validation `json:"validation,omitempty"`
	Options    []Option    `json:"options,omitempty"`
}

type Validation struct {
	Min *int `json:"min,omitempty"`
	Max *int `json:"max,omitempty"`
}

type Option struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type ApprovalProcess struct {
	ID         int64      `json:"id"`
	DocumentID int64      `json:"document_id"`
	Document   *Document  `json:"document,omitempty"` // Добавлено поле Document
	Status     string     `json:"status"`
	CreatedAt  time.Time  `json:"created_at"`
	Approvers  []Approver `json:"approvers,omitempty"`
}

type Approver struct {
	ID         int64      `json:"id"`
	ProcessID  int64      `json:"process_id"`
	UserID     int64      `json:"user_id"`
	User       *User      `json:"user,omitempty"` // Добавлено поле User
	Status     string     `json:"status"`
	Comment    string     `json:"comment,omitempty"`
	ApprovedAt *time.Time `json:"approved_at,omitempty"`
}

type User struct {
	ID        int64     `json:"id"`
	ESIAID    string    `json:"esia_id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// Добавим структуры для работы с папками
type Folder struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	ParentID  *int64    `json:"parent_id,omitempty"`
	Path      string    `json:"path"`
	CreatedAt time.Time `json:"created_at"`
}

type FolderNode struct {
	Folder
	Children []*FolderNode `json:"children,omitempty"`
	Files    []Document    `json:"files,omitempty"`
}
