# Этап сборки
FROM golang:1.21-alpine AS builder

WORKDIR /build

# Установка необходимых зависимостей для сборки
RUN apk add --no-cache git gcc musl-dev

# Копирование файлов go.mod и go.sum
COPY go.mod go.sum ./

# Загрузка зависимостей и обновление go.mod
RUN go mod download && \
    go mod tidy

# Копирование исходного кода
COPY . .

# Сборка приложения с подробным выводом
RUN CGO_ENABLED=1 go build -v -o /build/main ./cmd/main.go

# Финальный этап
FROM alpine:3.18

WORKDIR /app

# Копирование бинарного файла и миграций
COPY --from=builder /build/main /app/main
COPY migrations /app/migrations

# Установка необходимых runtime зависимостей
RUN apk add --no-cache ca-certificates

# Делаем файл исполняемым
RUN chmod +x /app/main

# Запуск приложения
CMD ["/app/main"] 