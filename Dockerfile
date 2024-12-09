# Этап сборки
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Установка необходимых зависимостей для сборки
RUN apk add --no-cache git gcc musl-dev

# Копирование файлов go.mod и go.sum
COPY go.mod go.sum ./

# Загрузка зависимостей и обновление модулей
RUN go mod download && go mod tidy

# Копирование исходного кода
COPY . .

# Сборка приложения с подробным выводом
RUN CGO_ENABLED=1 go build -v -o main ./cmd/main.go

# Финальный этап
FROM alpine:3.18

WORKDIR /app

# Копирование бинарного файла из этапа сборки
COPY --from=builder build/main /main

# Проверка копирования файла
RUN ls -la /main

# Установка необходимых runtime зависимостей
RUN apk add --no-cache ca-certificates

# Установка правильных прав на исполняемый файл
RUN chmod +x /main

# Проверка прав доступа
RUN ls -la /main

# Запуск приложения
CMD ["/main"] 