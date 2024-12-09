package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

type GlusterStorage struct {
	mountPoint string
}

func NewGlusterStorage(mountPoint string) *GlusterStorage {
	return &GlusterStorage{
		mountPoint: mountPoint,
	}
}

// ExtractText реализует интерфейс StorageService
func (s *GlusterStorage) ExtractText(filePath string) (string, error) {
	// Сначала скачиваем файл во временную директорию
	tempFile, err := s.downloadToTemp(filePath)
	if err != nil {
		return "", fmt.Errorf("ошибка скачивания файла: %w", err)
	}
	defer os.Remove(tempFile.Name()) // Удаляем временный файл после использования
	defer tempFile.Close()

	// Создаем временный LocalStorage для обработки файла
	localStorage := NewLocalStorage("")
	return localStorage.ExtractText(tempFile.Name())
}

func (s *GlusterStorage) downloadToTemp(filePath string) (*os.File, error) {
	ext := filepath.Ext(filePath)
	// Создаем временный файл
	tempFile, err := os.CreateTemp("", "gluster_temp_*"+ext)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания временного файла: %w", err)
	}

	// Открываем исходный файл
	fullPath := filepath.Join(s.mountPoint, filePath)
	srcFile, err := os.Open(fullPath)
	if err != nil {
		tempFile.Close()
		os.Remove(tempFile.Name())
		return nil, fmt.Errorf("ошибка открытия файла: %w", err)
	}
	defer srcFile.Close()

	// Копируем содержимое
	_, err = io.Copy(tempFile, srcFile)
	if err != nil {
		tempFile.Close()
		os.Remove(tempFile.Name())
		return nil, fmt.Errorf("ошибка копирования файла: %w", err)
	}

	// Перемещаем указатель в начало файла
	_, err = tempFile.Seek(0, 0)
	if err != nil {
		tempFile.Close()
		os.Remove(tempFile.Name())
		return nil, fmt.Errorf("ошибка перемещения указателя: %w", err)
	}

	return tempFile, nil
}

// Существующие методы...
func (s *GlusterStorage) SaveFile(file io.Reader, filename string) (string, error) {
	uniqueFilename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filename)
	path := s.generatePath(uniqueFilename)
	fullPath := filepath.Join(s.mountPoint, path)

	// Создаем директории если не существуют
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return "", fmt.Errorf("ошибка создания директорий: %w", err)
	}

	// Создаем файл
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("ошибка создания файла: %w", err)
	}
	defer dst.Close()

	// Копируем содержимое
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("ошибка копирования файла: %w", err)
	}

	return path, nil
}

func (s *GlusterStorage) GetFile(path string) (io.ReadCloser, error) {
	fullPath := filepath.Join(s.mountPoint, path)
	file, err := os.Open(fullPath)
	if err != nil {
		return nil, fmt.Errorf("ошибка открытия файла: %w", err)
	}
	return file, nil
}

func (s *GlusterStorage) generatePath(filename string) string {
	// Генерируем путь на основе текущей даты
	now := time.Now()
	return filepath.Join(
		fmt.Sprintf("%d", now.Year()),
		fmt.Sprintf("%02d", now.Month()),
		fmt.Sprintf("%02d", now.Day()),
		filename,
	)
}
