FROM node:alpine as build 

WORKDIR /app

# Объявляем аргумент сборки
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN echo "REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL" > .env
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
