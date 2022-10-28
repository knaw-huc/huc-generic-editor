FROM nginx:alpine

COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js

EXPOSE 80