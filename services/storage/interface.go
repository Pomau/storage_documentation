package storage

import "io"

type StorageService interface {
	SaveFile(file io.Reader, filename string) (string, error)
	GetFile(path string) (io.ReadCloser, error)
	ExtractText(filePath string) (string, error)
}
