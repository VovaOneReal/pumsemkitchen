При изменении схемы БД:

1. Переинтроспектировать: `npx drizzle-kit introspect` — перегенерирует `db/schema.ts`.
2. Вручную обновить `db/relations.ts` если изменились связи.
3. Запустить сид: `npx tsx db/seed.ts`
