При изменении схемы БД:

1. Переинтроспектировать: `npx drizzle-kit introspect` — перегенерирует `db/schema.ts`.
2. Вручную обновить `db/relations.ts` если изменились связи.
3. Запустить сид: `npx tsx db/seed.ts`

---

## Запуск production-сборки через Docker

Доступны два варианта в зависимости от того, где работает PostgreSQL.

---

### Вариант 1: PostgreSQL внутри Docker (`docker-compose.yml`)

БД поднимается вместе с приложением в отдельном контейнере.

#### Переменные окружения

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<пароль>
POSTGRES_DB=pumsemkitchen

FRONTEND_PORT=3000

# Хост — имя сервиса в compose, не localhost
DATABASE_URL=postgres://postgres:<пароль>@postgres:5432/pumsemkitchen

NUXT_SESSION_PASSWORD=<случайная строка длиной 32+ символа>
INVITE_CODE=<код приглашения>
INVITE_CODE_ADMIN=<код приглашения администратора>
```

#### Первый запуск

```bash
docker compose up --build -d
```

#### Остановка

```bash
docker compose down
```

Данные PostgreSQL хранятся в именованном volume `postgres_data` и не удаляются при остановке. Чтобы удалить и данные:

```bash
docker compose down -v
```

---

### Вариант 2: PostgreSQL вне Docker (`docker-compose.external-db.yml`)

Используется, когда PostgreSQL уже запущен на хост-машине или на удалённом сервере.

#### Переменные окружения

```env
FRONTEND_PORT=3000

# Windows / macOS: используй host.docker.internal вместо localhost
DATABASE_URL=postgres://postgres:<пароль>@host.docker.internal:5432/pumsemkitchen

# Для удалённого сервера — обычный хост/IP
# DATABASE_URL=postgres://postgres:<пароль>@192.168.1.100:5432/pumsemkitchen

NUXT_SESSION_PASSWORD=<случайная строка длиной 32+ символа>
INVITE_CODE=<код приглашения>
INVITE_CODE_ADMIN=<код приглашения администратора>
```

> На **Linux** `host.docker.internal` недоступен по умолчанию, но прописан через `extra_hosts` в compose-файле, поэтому работает без дополнительных настроек.

#### Первый запуск

```bash
docker compose -f docker-compose.external-db.yml up --build -d
```

#### Остановка

```bash
docker compose -f docker-compose.external-db.yml down
```

---

### Общие команды

```bash
# Обновить приложение (пересборка образа)
docker compose [-f <файл>] up --build -d

# Логи всех сервисов
docker compose [-f <файл>] logs -f

# Логи только приложения
docker compose [-f <файл>] logs -f app
```

После запуска приложение доступно по адресу `http://localhost:3000` (или порту из `FRONTEND_PORT`).
