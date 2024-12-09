FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости и vite глобально
RUN npm install && \
    npm install -g vite

# Копируем остальные файлы проекта
COPY . .

# Открываем порты
EXPOSE 80
EXPOSE 443

# Устанавливаем nginx
RUN apk add --no-cache nginx

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Копируем SSL сертификаты
COPY pomau.crt /etc/ssl/pomau.crt
COPY pomau.key /etc/ssl/pomau.key

# Запускаем nginx и приложение
CMD nginx && npm run dev -- --host 