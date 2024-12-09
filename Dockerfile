# Этап сборки
FROM golang:1.21-alpine AS builder

WORKDIR /build

# Установка необходимых зависимостей для сборки
RUN apk add --no-cache git gcc musl-dev

# Копирование файлов go.mod и go.sum
COPY go.mod go.sum ./

# Загрузка зависимостей
RUN go mod download

# Копирование исходного кода
COPY . .

# Сборка приложения с подробным выводом
RUN CGO_ENABLED=1 go build -v -o main cmd/main.go

# Финальный этап
FROM alpine:3.18

WORKDIR /app

# Копирование бинарного файла из этапа сборки
COPY --from=builder /build/main .

# Установка необходимых runtime зависимостей
RUN apk add --no-cache ca-certificates

# Запуск приложения
CMD ["./main"] 