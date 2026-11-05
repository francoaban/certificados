import { applyCase } from './text'
import { DOC_TYPES, effectiveDocType, formatDocument } from './documents'

/** Aplica mayúsculas, tipo y formato de documento según las opciones. */
export function resolveRecord(record, opts = {}) {
  const nombre = applyCase(record.nombre, opts.caseMode)
  const apellido = applyCase(record.apellido, opts.caseMode)
  const docType = effectiveDocType(record, opts)
  const docDisplay = formatDocument(record.docNumber, docType, { dots: opts.docDots !== false })
  return {
    nombre,
    apellido,
    fullName: [nombre, apellido].filter(Boolean).join(' '),
    docType,
    docDisplay,
    docLine: docDisplay ? `${DOC_TYPES[docType].short} N° ${docDisplay}` : '',
  }
}

const safe = (s) => String(s).replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '')

export const FILENAME_FORMATS = [
  { id: 'nombre-apellido', label: 'Nombre_Apellido' },
  { id: 'apellido-nombre', label: 'Apellido_Nombre' },
  { id: 'apellido-nombre-doc', label: 'Apellido_Nombre_Documento' },
]

/** Nombre de archivo (sin extensión). */
export function buildFileName(view, record, format = 'nombre-apellido') {
  let parts
  if (format === 'apellido-nombre') parts = [view.apellido, view.nombre]
  else if (format === 'apellido-nombre-doc') parts = [view.apellido, view.nombre, record.docNumber]
  else parts = [view.nombre, view.apellido]
  const body = safe(parts.filter(Boolean).join(' ')) || 'sin_nombre'
  return `Certificado_${body}`
}