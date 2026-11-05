import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { loadDefaultLogo } from './logo'
import { resolveRecord, buildFileName } from './records'

export const DEFAULT_OPTIONS = {
  title: 'CERTIFICADO',
  subtitle: 'DE RECONOCIMIENTO',
  preText: 'Se otorga el presente certificado a',
  bodyText:
    'Por su destacada participación y compromiso, otorgándose el presente en reconocimiento a su dedicación y esfuerzo.',
  signatureLeft: 'Director/a',
  signatureRight: 'Coordinador/a',
  date: new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  useLogo: true,
  customLogo: null,
  caseMode: 'asis', // asis | upper | title
  docDots: true, // 12.345.678 vs 12345678
  defaultDocType: 'auto', // auto o un id de DOC_TYPES
  fileNameFormat: 'nombre-apellido',
}

const COLORS = {
  bg: [253, 250, 243],
  navy: [30, 41, 82],
  gold: [184, 150, 60],
  text: [75, 85, 99],
}

const W = 297
const H = 210

/* ---------- Logo (se carga una vez y se reduce) ---------- */
async function prepare(options) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let logo = null
  if (opts.useLogo) {
    logo = opts.customLogo || (await loadDefaultLogo().catch(() => null))
  }
  return { opts, logo }
}

/* ---------- Dibujo ---------- */
function drawCorner(doc, x, y, dx, dy) {
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.8)
  doc.line(x, y, x + 14 * dx, y)
  doc.line(x, y, x, y + 14 * dy)
  doc.setFillColor(...COLORS.gold)
  doc.circle(x + 3 * dx, y + 3 * dy, 1.2, 'F')
}

function drawCertificate(doc, record, opts, logo) {
  const view = resolveRecord(record, opts)

  doc.setFillColor(...COLORS.bg)
  doc.rect(0, 0, W, H, 'F')

  doc.setDrawColor(...COLORS.navy)
  doc.setLineWidth(2.5)
  doc.rect(8, 8, W - 16, H - 16)
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.6)
  doc.rect(12, 12, W - 24, H - 24)

  drawCorner(doc, 17, 17, 1, 1)
  drawCorner(doc, W - 17, 17, -1, 1)
  drawCorner(doc, 17, H - 17, 1, -1)
  drawCorner(doc, W - 17, H - 17, -1, -1)

  if (logo) {
    // Entra en una caja de 60 × 24 mm, centrada
    let h = 24
    let w = h * logo.ratio
    if (w > 60) {
      w = 60
      h = w / logo.ratio
    }
    doc.addImage(logo.dataUrl, 'PNG', W / 2 - w / 2, 16 + (24 - h) / 2, w, h, 'logo', 'FAST')
  }

  doc.setFont('times', 'bold')
  doc.setTextColor(...COLORS.navy)
  doc.setFontSize(36)
  doc.text(opts.title || '', W / 2, 55, { align: 'center', charSpace: 2 })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.gold)
  doc.text(opts.subtitle || '', W / 2, 64, { align: 'center', charSpace: 3 })

  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - 30, 69, W / 2 + 30, 69)

  doc.setFont('times', 'italic')
  doc.setFontSize(15)
  doc.setTextColor(...COLORS.text)
  doc.text(opts.preText || '', W / 2, 82, { align: 'center' })

  // Nombre destacado (se achica si no entra)
  const maxWidth = W - 80
  let size = 38
  doc.setFont('times', 'bolditalic')
  doc.setTextColor(...COLORS.navy)
  doc.setFontSize(size)
  while (doc.getTextWidth(view.fullName) > maxWidth && size > 16) {
    size -= 1
    doc.setFontSize(size)
  }
  doc.text(view.fullName, W / 2, 103, { align: 'center' })

  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.8)
  doc.line(W / 2 - 80, 109, W / 2 + 80, 109)

  // Documento (opcional)
  if (view.docLine) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.text)
    doc.text(view.docLine, W / 2, 117, { align: 'center', charSpace: 0.5 })
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.text)
  const lines = doc.splitTextToSize(opts.bodyText || '', 190)
  doc.text(lines, W / 2, 129, { align: 'center', lineHeightFactor: 1.5 })

  doc.setFontSize(11)
  doc.text(opts.date || '', W / 2, 152, { align: 'center' })

  const sigY = 175
  doc.setDrawColor(...COLORS.navy)
  doc.setLineWidth(0.5)
  doc.line(45, sigY, 110, sigY)
  doc.line(W - 110, sigY, W - 45, sigY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.navy)
  doc.text(opts.signatureLeft || '', 77.5, sigY + 6, { align: 'center' })
  doc.text(opts.signatureRight || '', W - 77.5, sigY + 6, { align: 'center' })

  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(1)
  doc.circle(W / 2, 170, 11)
  doc.setLineWidth(0.4)
  doc.circle(W / 2, 170, 8.5)
}

/* ---------- Utilidades ---------- */
const newDoc = () => new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const tick = () => new Promise((res) => setTimeout(res))

/* ---------- API pública ---------- */

/** URL (blob) de un PDF de una página, para la vista previa. */
export async function buildPreviewUrl(record, options = {}) {
  const { opts, logo } = await prepare(options)
  const doc = newDoc()
  drawCertificate(doc, record, opts, logo)
  return URL.createObjectURL(doc.output('blob'))
}

export async function generateCertificate(record, options = {}) {
  const { opts, logo } = await prepare(options)
  const doc = newDoc()
  drawCertificate(doc, record, opts, logo)
  const name = buildFileName(resolveRecord(record, opts), record, opts.fileNameFormat)
  doc.save(`${name}.pdf`)
}

/** Un solo PDF con una página por registro. */
export async function generateBulkPdf(records, options = {}) {
  const { opts, logo } = await prepare(options)
  const doc = newDoc()
  records.forEach((record, i) => {
    if (i > 0) doc.addPage('a4', 'landscape')
    drawCertificate(doc, record, opts, logo)
  })
  doc.save('Certificados.pdf')
}

/** ZIP con un PDF por registro. */
export async function generateZip(records, options = {}, onProgress) {
  const { opts, logo } = await prepare(options)
  const zip = new JSZip()
  const used = new Map()

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const doc = newDoc()
    drawCertificate(doc, record, opts, logo)

    let base = buildFileName(resolveRecord(record, opts), record, opts.fileNameFormat)
    const count = used.get(base) || 0
    used.set(base, count + 1)
    if (count) base += `_${count + 1}`

    zip.file(`${base}.pdf`, doc.output('arraybuffer'))
    onProgress?.(i + 1, records.length)
    if (i % 5 === 4) await tick()
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  downloadBlob(blob, 'Certificados.zip')
}