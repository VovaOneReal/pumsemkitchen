import { XMLParser } from 'fast-xml-parser'
import { db } from '~~/server/utils/db'
import { emissGoods, emissRecords } from '~~/db/schema'
import { eq } from 'drizzle-orm'

const MONTH_MAP: Record<string, number> = {
  январь: 1,
  февраль: 2,
  март: 3,
  апрель: 4,
  май: 5,
  июнь: 6,
  июль: 7,
  август: 8,
  сентябрь: 9,
  октябрь: 10,
  ноябрь: 11,
  декабрь: 12,
}

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступ запрещён' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((p) => p.name === 'file')

  if (!filePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Файл не передан' })
  }

  const xmlContent = filePart.data.toString('utf-8')

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    isArray: (name) => ['Code', 'Series', 'Value'].includes(name),
  })

  let parsed: any
  try {
    parsed = parser.parse(xmlContent)
  } catch {
    throw createError({ statusCode: 422, statusMessage: 'Неверный формат файла' })
  }

  const codeLists: any[] = parsed?.GenericData?.CodeLists?.CodeList ?? []

  // Карта кодов товаров: code → name
  const grtovList = codeLists.find((cl: any) => cl['@_id'] === 's_grtov')
  if (!grtovList) {
    throw createError({ statusCode: 422, statusMessage: 'Не найден справочник товаров s_grtov' })
  }
  const grtovMap = new Map<string, string>()
  for (const code of grtovList.Code ?? []) {
    grtovMap.set(
      String(code['@_value']),
      String(code.Description?.['#text'] ?? code.Description ?? ''),
    )
  }

  // Находим OKATO-код для РФ без новых субъектов
  const okatoList = codeLists.find((cl: any) => cl['@_id'] === 's_OKATO')
  let rfOkato: string | null = null
  for (const code of okatoList?.Code ?? []) {
    const desc = String(code.Description?.['#text'] ?? code.Description ?? '')
    if (desc.includes('Российская Федерация без учета')) {
      rfOkato = String(code['@_value'])
      break
    }
  }

  const allSeries: any[] = parsed?.GenericData?.DataSet?.Series ?? []

  // Группируем наблюдения по названию товара
  const byProduct = new Map<string, { date: string; price: number }[]>()

  for (const series of allSeries) {
    const keyValues: any[] = series.SeriesKey?.Value ?? []
    const okatoVal = keyValues.find((v: any) => v['@_concept'] === 's_OKATO')?.['@_value']
    const grtovVal = keyValues.find((v: any) => v['@_concept'] === 's_grtov')?.['@_value']

    // Фильтр по РФ: если rfOkato найден — строгий, иначе пропускаем фильтр
    if (rfOkato && okatoVal !== rfOkato) continue

    const productName = grtovMap.get(String(grtovVal))
    if (!productName) continue

    const attrValues: any[] = series.Attributes?.Value ?? []
    const period = attrValues.find((v: any) => v['@_concept'] === 'PERIOD')?.['@_value']
    const monthNum = MONTH_MAP[String(period).toLowerCase()]
    if (!monthNum) continue

    const obs = series.Obs
    const timeVal = String(obs?.Time ?? '').trim()
    const year = parseInt(timeVal, 10)
    if (!year || year < 2000) continue

    const rawPrice = String(obs?.ObsValue?.['@_value'] ?? '').replace(',', '.')
    const price = parseFloat(rawPrice)
    if (!price || price <= 0) continue

    const date = `${year}-${String(monthNum).padStart(2, '0')}-01`

    if (!byProduct.has(productName)) byProduct.set(productName, [])
    byProduct.get(productName)!.push({ date, price })
  }

  if (byProduct.size === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Не найдено данных для импорта' })
  }

  let addedGoods = 0
  let addedRecords = 0

  await db.transaction(async (tx) => {
    for (const [productName, observations] of byProduct) {
      // Ищем существующий товар по имени
      const existing = await tx.query.emissGoods.findFirst({
        where: eq(emissGoods.emissGoodsName, productName),
        with: { emissRecords: true },
      })

      let goodsId: number
      let existingDates: Set<string>

      if (!existing) {
        // Новый товар
        const [inserted] = await tx
          .insert(emissGoods)
          .values({ emissGoodsName: productName, isShowingGoods: false })
          .returning({ emissGoodsId: emissGoods.emissGoodsId })
        goodsId = inserted.emissGoodsId
        existingDates = new Set()
        addedGoods++
      } else {
        goodsId = existing.emissGoodsId
        existingDates = new Set(existing.emissRecords.map((r) => r.recordDate))
      }

      // Вставляем только новые даты
      const newObs = observations.filter((o) => !existingDates.has(o.date))
      if (newObs.length > 0) {
        await tx.insert(emissRecords).values(
          newObs.map((o) => ({
            emissGoodsId: goodsId,
            recordDate: o.date,
            recordPrice: String(o.price),
          })),
        )
        addedRecords += newObs.length
      }
    }
  })

  return { addedGoods, addedRecords }
})
