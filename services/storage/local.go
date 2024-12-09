package storage

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/guylaor/goword"
	"github.com/ledongthuc/pdf"
)

type LocalStorage struct {
	basePath string
}

func NewLocalStorage(basePath string) *LocalStorage {
	return &LocalStorage{basePath: basePath}
}

func (s *LocalStorage) ExtractText(filePath string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".pdf":
		return s.extractPDFText(filePath)
	case ".txt":
		return s.extractTXTText(filePath)
	case ".docx":
		return s.extractDOCXText(filePath)
	default:
		return "", fmt.Errorf("неподдерживаемый формат файла: %s", ext)
	}
}

func (s *LocalStorage) extractPDFText(filePath string) (string, error) {
	f, r, err := pdf.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("ошибка открытия PDF: %w", err)
	}
	defer f.Close()

	var text strings.Builder
	totalPage := r.NumPage()

	for pageIndex := 1; pageIndex <= totalPage; pageIndex++ {
		p := r.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}

		content, err := p.GetPlainText(nil)
		if err != nil {
			continue
		}
		text.WriteString(content)
	}

	return text.String(), nil
}

func (s *LocalStorage) extractTXTText(filePath string) (string, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("ошибка чтения файла: %w", err)
	}
	return string(content), nil
}

func (s *LocalStorage) extractDOCXText(filePath string) (string, error) {
	text, err := goword.ParseText(filePath)
	if err != nil {
		return "", fmt.Errorf("ошибка парсинга DOCX: %w", err)
	}

	return text, nil
}
