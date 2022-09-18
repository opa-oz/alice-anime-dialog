# Сборка ---------------------------------------

# В качестве базового образа для сборки используем node:12
FROM node:12

ARG DEBIAN_FRONTEND=noninteractive

# Установим рабочую директорию для билда
WORKDIR /app

# Вытаскиваем логи наружу
RUN mkdir logs
VOLUME /app/logs

# Открываем порты наружу
EXPOSE 3000
EXPOSE 80
EXPOSE 443

# Переносим запускатор
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Устанавливаем nginx
ENV NGINX_VERSION 1.18.0
ENV NJS_VERSION   0.4.0
ENV PKG_RELEASE   1

WORKDIR /var/www/nginx

RUN apt-get update && apt-get install -y nginx

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/mime.types /etc/nginx/mime.types

COPY certificates certificates/
COPY public public/

WORKDIR /app

# Переносим ресурсы
COPY resources resources/
COPY tsconfig.json .
COPY .env .

# Переносим и устанавливаем зависимости
COPY package.json .
COPY yarn.lock .
RUN yarn install

# Переносим файлы сервера
COPY server.ts .
COPY src src/

# Собираем проект
RUN yarn build

# Запуск ---------------------------------------
ENTRYPOINT ["/docker-entrypoint.sh"]
