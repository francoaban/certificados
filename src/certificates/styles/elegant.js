import {
  PAGE_WIDTH,
  composeDateLine,
  drawCenteredText,
  drawDiamond,
  drawLogo,
  drawSignature,
  drawWrappedText,
} from '../shared.js'

const IVORY = [245, 234, 208]
const SOFT = [206, 196, 175]
const GOLD = [212, 175, 106]
const GOLD_DIM = [150, 128, 80]

/**
 * Estilo 3 — Elegante.
 * Fondo azul profundo, detalles dorados y nombre en Pinyon Script.
 */
export const elegantStyle = {
  id: 'elegante',
  name: 'Elegante',
  description: 'Fondo azul profundo, ornamentos dorados y caligrafía Pinyon Script.',
  background: 'backgrounds/elegante.svg',
  fonts: {
    script: { family: 'PinyonScript', file: 'fonts/PinyonScript-Regular.ttf' },
  },

  draw(doc, { options, view, logo }) {
    const centerX = PAGE_WIDTH / 2

    drawLogo(doc, logo, { centerX, top: 13, maxWidth: 26, maxHeight: 16 })

    drawCenteredText(doc, options.title, 50, {
      size: 30,
      font: 'times',
      style: 'bold',
      color: IVORY,
      charSpace: 3,
      maxWidth: 250,
    })

    drawCenteredText(doc, options.subtitle, 58.5, {
      size: 8.8,
      font: 'helvetica',
      color: GOLD,
      charSpace: 2.6,
      maxWidth: 240,
    })

    doc.setDrawColor(...GOLD_DIM)
    doc.setLineWidth(0.3)
    doc.line(centerX - 35, 65, centerX + 35, 65)
    drawDiamond(doc, centerX, 65, 1.8, GOLD)

    drawCenteredText(doc, options.preText, 81, {
      size: 12,
      font: 'times',
      style: 'italic',
      color: SOFT,
      maxWidth: 230,
    })

    drawCenteredText(doc, view.fullName, 103, {
      size: 47,
      font: 'PinyonScript',
      style: 'normal',
      color: GOLD,
      maxWidth: 215,
      minSize: 26,
    })

    if (view.docLine) {
      drawCenteredText(doc, view.docLine, 115.5, {
        size: 8.6,
        font: 'helvetica',
        color: SOFT,
        charSpace: 0.4,
        maxWidth: 200,
      })
    }

    doc.setDrawColor(...GOLD_DIM)
    doc.setLineWidth(0.3)
    doc.line(centerX - 90, 121, centerX + 90, 121)

    drawWrappedText(doc, options.bodyText, centerX, 135.5, {
      width: 184,
      size: 10.4,
      font: 'times',
      color: SOFT,
      lineHeight: 1.5,
    })

    drawSignature(doc, {
      centerX: 80,
      y: 167,
      width: 58,
      text: options.signatureLeft,
      lineColor: GOLD_DIM,
      textColor: IVORY,
      font: 'times',
      style: 'italic',
      fontSize: 11,
    })

    drawSignature(doc, {
      centerX: 217,
      y: 167,
      width: 58,
      text: options.signatureRight,
      lineColor: GOLD_DIM,
      textColor: IVORY,
      font: 'times',
      style: 'italic',
      fontSize: 11,
    })

    drawCenteredText(doc, composeDateLine(options), 192, {
      size: 8.6,
      font: 'times',
      style: 'italic',
      color: [198, 177, 132],
      maxWidth: 220,
    })
  },
}
