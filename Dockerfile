# Стадия сборки
FROM node:22-alpine AS builder

WORKDIR /app

# Нативные зависимости для bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Стадия запуска
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Копируем только собранный артефакт — nitro бандлит все зависимости
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
