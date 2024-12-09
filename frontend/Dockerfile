FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Открываем порты
EXPOSE 80
EXPOSE 443

# Устанавливаем nginx
RUN apk add --no-cache nginx

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Создаем директорию для SSL сертификатов (если нужно)
RUN mkdir -p /etc/nginx/ssl

# Запускаем nginx и приложение
CMD nginx && npm run dev 