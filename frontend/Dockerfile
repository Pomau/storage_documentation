FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Устанавливаем vite глобально
RUN npm install -g vite

# Копируем остальные файлы проекта
COPY . .

# Открываем порты
EXPOSE 80
EXPOSE 443
EXPOSE 5173

# Устанавливаем nginx
RUN apk add --no-cache nginx

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Создаем директорию для SSL сертификатов
RUN mkdir -p /etc/ssl

# Копируем SSL сертификаты
COPY pomau.crt /etc/ssl/pomau.crt
COPY pomau.key /etc/ssl/pomau.key

# Даем права на выполнение npm
RUN chown -R node:node /app

# Создаем и настраиваем скрипт запуска
COPY <<EOF /start.sh
#!/bin/sh
nginx
cd /app && npm run dev
EOF

RUN chmod +x /start.sh

# Запускаем приложение
CMD ["/start.sh"]