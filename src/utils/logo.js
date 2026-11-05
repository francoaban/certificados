import escudoUrl from '../assets/escudo.png'

export const DEFAULT_LOGO_URL = escudoUrl

const MAX_HEIGHT = 400
const MAX_WIDTH = 800
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// Carga una imagen, la reduce y devuelve { dataUrl, ratio }
function rasterize(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error('La imagen no tiene dimensiones válidas.'))
        return
      }
      const scale = Math.min(1, MAX_HEIGHT / img.naturalHeight, MAX_WIDTH / img.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        ratio: img.naturalWidth / img.naturalHeight,
      })
    }
    img.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    img.src = src
  })
}

let defaultLogoPromise = null

/** Escudo del IPSEL (se procesa una sola vez). */
export function loadDefaultLogo() {
  defaultLogoPromise ??= rasterize(escudoUrl)
  return defaultLogoPromise
}

/** Procesa un archivo elegido por el usuario → { dataUrl, ratio, name }. */
export async function processLogoFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Formato no admitido. Usá PNG, JPG o WebP.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('La imagen supera los 5 MB.')
  }
  const url = URL.createObjectURL(file)
  try {
    const logo = await rasterize(url)
    return { ...logo, name: file.name }
  } finally {
    URL.revokeObjectURL(url)
  }
}