FROM nginx:alpine

COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY html/index.html /usr/share/nginx/html

EXPOSE 80