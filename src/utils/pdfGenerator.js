import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { loadDefaultLogo } from './logo'
import { resolveRecord, buildFileName } from './records'
import { DEFAULT_OPTIONS } from '../certificates/defaults'
import { getStyle } from '../certificates/styles/index'
import { applyFonts, composePlaceLine, loadImageAsset, prepareFonts } from '../certificates/shared'

export { DEFAULT_OPTIONS }

const W = 297
const H = 210

/* ---------- Preparación de recursos (se cachea entre certificados) ---------- */
async function prepare(options) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const style = getStyle(opts.style)
  const backgroundSource =
    opts.showImageBackground && opts.imageBackground
      ? opts.imageBackground
      : opts.background || style.background

  const [logo, background, fonts] = await Promise.all([
    opts.useLogo
      ? opts.customLogo || loadDefaultLogo().catch(() => null)
      : Promise.resolve(null),
    opts.useBackground === false
      ? Promise.resolve(null)
      : backgroundSource
        ? loadImageAsset(backgroundSource, {
            scale: 1.5,
            maxWidth: 1900,
            mime: 'image/jpeg',
            quality: 0.92,
          })
        : Promise.resolve(null),
    prepareFonts(style.fonts),
  ])

  return { opts, style, logo, background, fonts }
}

/* ---------- Documento ---------- */
function createDoc({ background, fonts }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  applyFonts(doc, fonts)
  addBackground(doc, background)
  return doc
}

function addBackground(doc, background) {
  if (!background) return
  doc.addImage(background.dataUrl, 'JPEG', 0, 0, W, H, 'bg', 'FAST')
}

function drawCertificate(doc, record, opts, style, logo) {
  const view = resolveRecord(record, opts)

  doc.setProperties({
    title: `${opts.title || 'Certificado'} - ${view.fullName}`,
    subject: opts.subtitle || '',
    author: composePlaceLine(opts),
    creator: 'Generador de certificados (jsPDF)',
    keywords: [opts.title, view.fullName, view.docDisplay].filter(Boolean).join(', '),
  })

  style.draw(doc, { options: opts, view, logo })
  return view
}

/* ---------- Utilidades ---------- */
const newPage = (doc, background) => {
  doc.addPage('a4', 'landscape')
  addBackground(doc, background)
}

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
  const ctx = await prepare(options)
  const doc = createDoc(ctx)
  drawCertificate(doc, record, ctx.opts, ctx.style, ctx.logo)
  return URL.createObjectURL(doc.output('blob'))
}

export async function generateCertificate(record, options = {}) {
  const ctx = await prepare(options)
  const doc = createDoc(ctx)
  const view = drawCertificate(doc, record, ctx.opts, ctx.style, ctx.logo)
  const name = buildFileName(view, record, ctx.opts.fileNameFormat)
  doc.save(`${name}.pdf`)
}

/** Un solo PDF con una página por registro. */
export async function generateBulkPdf(records, options = {}) {
  const ctx = await prepare(options)
  const doc = createDoc(ctx)

  records.forEach((record, i) => {
    if (i > 0) newPage(doc, ctx.background)
    drawCertificate(doc, record, ctx.opts, ctx.style, ctx.logo)
  })

  doc.save('Certificados.pdf')
}

/** ZIP con un PDF por registro. */
export async function generateZip(records, options = {}, onProgress) {
  const ctx = await prepare(options)
  const zip = new JSZip()
  const used = new Map()

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const doc = createDoc(ctx)
    const view = drawCertificate(doc, record, ctx.opts, ctx.style, ctx.logo)

    let base = buildFileName(view, record, ctx.opts.fileNameFormat)
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
