FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package.json package-lock.json ./
RUN npm install

# Копирование исходного кода
COPY . .


EXPOSE 5173

CMD ["npm", "run", "dev"] 