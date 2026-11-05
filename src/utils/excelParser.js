import * as XLSX from 'xlsx'
import { normalizeText } from './text'
import { cleanDocument, parseDocType } from './documents'

const NAME_KEYS = ['nombre', 'nombres', 'name', 'first name', 'firstname', 'given name']
const LAST_KEYS = ['apellido', 'apellidos', 'last name', 'lastname', 'surname', 'family name']
const DOC_TYPE_KEYS = ['tipo documento', 'tipo de documento', 'tipo doc', 'tipo de doc']
const DOC_KEYS = [
  'dni', 'd n i', 'doc', 'documento', 'nro documento', 'nro de documento', 'numero de documento',
  'numero documento', 'n documento', 'num documento', 'nro doc', 'nro de doc', 'nro dni'
]

function detectColumn(headers, exactKeys, partials = []) {
  return (
    headers.find((h) => exactKeys.includes(normalizeText(h))) ||
    headers.find((h) => partials.some((p) => normalizeText(h).includes(p)))
  )
}

export async function readWorkbook(file) {
  const buffer = await file.arrayBuffer()
  return XLSX.read(buffer, { type: 'array' })
}

/**
 * @returns {{ records, columns: { nameKey, lastKey, docKey, docTypeKey }, usedFallback }}
 */
export function parseSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
  if (!rows.length) throw new Error(`La hoja «${sheetName}» no contiene registros.`)

  const headers = Object.keys(rows[0])
  const docTypeKey = detectColumn(headers, DOC_TYPE_KEYS, ['tipo de doc', 'tipo doc']) || null
  const docKey =
    detectColumn(
      headers.filter((h) => h !== docTypeKey),
      DOC_KEYS,
      ['dni', 'documento']
    ) || null

  let nameKey = detectColumn(headers, NAME_KEYS, ['nombre'])
  let lastKey = detectColumn(headers, LAST_KEYS, ['apellido'])
  let usedFallback = false

  if (!nameKey || !lastKey) {
    usedFallback = true
    const candidates = headers.filter((h) => ![docKey, docTypeKey, nameKey, lastKey].includes(h))
    nameKey = nameKey || candidates.shift()
    lastKey = lastKey || candidates.shift() || null
  }

  const records = rows
    .map((row, i) => {
      const docType = docTypeKey ? parseDocType(row[docTypeKey]) : null
      return {
        id: i,
        nombre: String(row[nameKey] ?? '').trim(),
        apellido: lastKey ? String(row[lastKey] ?? '').trim() : '',
        docType, // null = se decide automáticamente / según el panel
        docNumber: docKey ? cleanDocument(row[docKey], docType) : '',
      }
    })
    .filter((r) => r.nombre || r.apellido)

  if (!records.length) throw new Error('No se encontraron nombres válidos en el archivo.')

  return { records, columns: { nameKey, lastKey, docKey, docTypeKey }, usedFallback }
}

export function downloadTemplate() {
  const rows = [
    ['Nombre', 'Apellido', 'Tipo de documento', 'Documento'],
    ['Juan', 'Pérez', 'DNI', '12345678'],
    ['María', 'Gómez', 'DNI', '30123456'],
    ['Ana', 'Souza', 'Pasaporte', 'FA123456'],
    ['Carlos', 'Mamani', 'DNI extranjero', '93456789'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Participantes')
  XLSX.writeFile(wb, 'plantilla_certificados.xlsx')
}