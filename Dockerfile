# DELIKREOL — Dockerfile pour Koyeb (SPA statique)
# Build local : npm run build
# Build image : docker build -t delikreol:latest -f Dockerfile .
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1