export default defineEventHandler(async (event) => {
  // Защищаем только API-роуты
  if (!event.path.startsWith('/api/')) return

  const open = ['/api/auth/', '/api/_', '/api/products/public']
  if (open.some((p) => event.path.startsWith(p))) return

  await requireUserSession(event)
})
