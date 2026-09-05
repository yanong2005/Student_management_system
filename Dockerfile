FROM php:8.2-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache nginx bash supervisor tzdata \
    && docker-php-ext-install pdo pdo_mysql \
    && mkdir -p /run/nginx /var/log/nginx /tmp/nginx-client-body

COPY . /var/www/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
