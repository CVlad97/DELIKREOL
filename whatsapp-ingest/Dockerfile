FROM node:22-alpine
WORKDIR /app
COPY server.js .
RUN addgroup -S app && adduser -S -G app app && mkdir -p /data && chown -R app:app /app /data
USER app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
