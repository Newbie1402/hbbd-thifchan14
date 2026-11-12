FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production MEMORIES_API_PORT=8787 MEMORIES_DB_PATH=/app/data/birthday-os.sqlite
EXPOSE 8787
CMD ["npm", "run", "api:start"]
