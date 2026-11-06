export const PAGE_WIDTH = 297
export const PAGE_HEIGHT = 210

const ASSET_CACHE = new Map()
const FONT_CACHE = new Map()

/** Convierte una ruta de /public en URL respetando el base de Vite. */
export function publicUrl(path) {
  if (!path) return ''
  if (/^(data:|blob:|https?:)/i.test(path)) return path
  const base = import.meta.env?.BASE_URL || '/'
  return `${base.replace(/\/?$/, '/')}${String(path).replace(/^\//, '')}`
}

/** Carga una imagen (incluido SVG) y la convierte a PNG/JPEG para jsPDF. */
export async function loadImageAsset(
  source,
  { scale = 1, maxWidth = 2000, mime = 'image/png', quality = 0.92 } = {},
) {
  const url = publicUrl(source)
  const key = `${url}|${scale}|${maxWidth}|${mime}|${quality}`
  if (ASSET_CACHE.has(key)) return ASSET_CACHE.get(key)

  const promise = (async () => {
    const image = await loadHtmlImage(url)
    const naturalWidth = image.naturalWidth || image.width || 1123
    const naturalHeight = image.naturalHeight || image.height || 794
    const finalScale = Math.min(scale, maxWidth / naturalWidth)
    const width = Math.max(1, Math.round(naturalWidth * finalScale))
    const height = Math.max(1, Math.round(naturalHeight * finalScale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (mime === 'image/jpeg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
    }
    context.drawImage(image, 0, 0, width, height)

    return {
      dataUrl: canvas.toDataURL(mime, quality),
      width: naturalWidth,
      height: naturalHeight,
    }
  })()

  ASSET_CACHE.set(key, promise)
  try {
    return await promise
  } catch (error) {
    ASSET_CACHE.delete(key)
    throw error
  }
}

function loadHtmlImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`))
    image.src = src
  })
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

/** Descarga y cachea las fuentes TTF declaradas por un estilo. */
export async function prepareFonts(fonts = {}) {
  const entries = Object.values(fonts).filter(Boolean)
  return Promise.all(
    entries.map(async ({ family, file, style = 'normal' }) => {
      const url = publicUrl(file)
      let base64Promise = FONT_CACHE.get(url)
      if (!base64Promise) {
        base64Promise = (async () => {
          const response = await fetch(url)
          if (!response.ok) throw new Error(`No se pudo cargar la fuente: ${url}`)
          return arrayBufferToBase64(await response.arrayBuffer())
        })()
        FONT_CACHE.set(url, base64Promise)
      }
      try {
        return { family, style, base64: await base64Promise }
      } catch (error) {
        FONT_CACHE.delete(url)
        throw error
      }
    }),
  )
}

/** Registra en un documento jsPDF las fuentes ya descargadas. */
export function applyFonts(doc, preparedFonts = []) {
  for (const { family, style, base64 } of preparedFonts) {
    const vfsName = `${family}.ttf`
    doc.addFileToVFS(vfsName, base64)
    doc.addFont(vfsName, family, style)
  }
}

/** "San Salvador de Jujuy, Argentina · 5 de noviembre de 2026" */
export function composePlaceLine(options = {}) {
  const showCity = options.showCity ?? true
  const showProvince = options.showProvince ?? false
  const showCountry = options.showCountry ?? false

  return [
    showCity && (options.city || options.locations),
    showProvince && options.province,
    showCountry && (options.country || options.contry),
  ]
    .filter(Boolean)
    .join(', ')
}

export function composeDateLine(options) {
  return [composePlaceLine(options), options.date].filter(Boolean).join(' · ')
}

/** Dibuja texto con tamaño ajustable y espaciado entre letras. */
export function drawText(
  doc,
  text,
  x,
  y,
  {
    size = 12,
    font = 'times',
    style = 'normal',
    color = [0, 0, 0],
    align = 'left',
    charSpace = 0,
    maxWidth,
    minSize = 8,
  } = {},
) {
  if (text === undefined || text === null || text === '') return size

  doc.setFont(font, style)
  let finalSize = size
  doc.setFontSize(finalSize)

  if (maxWidth) {
    while (finalSize > minSize && doc.getTextWidth(String(text)) > maxWidth) {
      finalSize = Math.max(minSize, Math.round((finalSize - 0.5) * 10) / 10)
      doc.setFontSize(finalSize)
    }
  }

  doc.setTextColor(color[0], color[1], color[2])
  if (charSpace) doc.setCharSpace(charSpace)
  doc.text(String(text), x, y, { align })
  if (charSpace) doc.setCharSpace(0)

  return finalSize
}

/** Texto centrado en el ancho de la página. */
export function drawCenteredText(doc, text, y, options = {}) {
  return drawText(doc, text, PAGE_WIDTH / 2, y, { ...options, align: 'center' })
}

/** Texto multilínea con ajuste automático. */
export function drawWrappedText(
  doc,
  text,
  x,
  y,
  {
    width = 180,
    size = 11,
    font = 'times',
    style = 'normal',
    color = [0, 0, 0],
    align = 'center',
    lineHeight = 1.45,
    maxLines,
  } = {},
) {
  if (!text) return y

  doc.setFont(font, style)
  doc.setFontSize(size)
  doc.setTextColor(color[0], color[1], color[2])

  let lines = doc.splitTextToSize(String(text), width)
  if (maxLines) lines = lines.slice(0, maxLines)

  const lineStep = size * 0.352778 * lineHeight
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * lineStep, { align })
  })

  return y + lines.length * lineStep
}

export function drawDiamond(doc, x, y, size, color) {
  doc.setFillColor(color[0], color[1], color[2])
  doc.triangle(x, y - size, x + size, y, x, y + size, 'F')
  doc.triangle(x, y - size, x - size, y, x, y + size, 'F')
}

export function drawSignature(
  doc,
  {
    centerX,
    y,
    width = 60,
    text,
    lineColor = [180, 173, 156],
    textColor = [30, 40, 60],
    font = 'times',
    style = 'italic',
    fontSize = 11,
  },
) {
  doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2])
  doc.setLineWidth(0.35)
  doc.line(centerX - width / 2, y, centerX + width / 2, y)

  drawText(doc, text, centerX, y + 7, {
    size: fontSize,
    font,
    style,
    color: textColor,
    align: 'center',
    maxWidth: width,
  })
}

/**
 * Dibuja el logo conservando su relación de aspecto.
 * Acepta { dataUrl, ratio } (utils/logo) o { dataUrl, width, height }.
 */
export function drawLogo(
  doc,
  logo,
  { centerX, x = 0, top, maxWidth = 26, maxHeight = 16, align = 'center', alias = 'logo' },
) {
  if (!logo) return null

  const ratio = logo.ratio || (logo.width && logo.height ? logo.width / logo.height : 1)
  let height = maxHeight
  let width = height * ratio
  if (width > maxWidth) {
    width = maxWidth
    height = width / ratio
  }

  const left = align === 'center' ? centerX - width / 2 : x
  doc.addImage(logo.dataUrl, 'PNG', left, top, width, height, alias, 'FAST')
  return { x: left, y: top, width, height }
}
