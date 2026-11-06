import {
  composeDateLine,
  drawLogo,
  drawSignature,
  drawText,
  drawWrappedText,
} from '../shared.js'

const NAVY = [18, 38, 63]
const TEAL = [47, 127, 122]
const GRAY = [95, 110, 124]
const LIGHT = [208, 218, 224]
const GOLD = [194, 162, 81]

/**
 * Estilo 2 — Moderno.
 * Composición alineada a la izquierda, tipografía sans y nombre en Sacramento.
 */
export const modernStyle = {
  id: 'moderno',
  name: 'Moderno',
  description: 'Diagramación alineada a la izquierda, azul/turquesa y caligrafía Sacramento.',
  background: 'backgrounds/moderno.svg',
  fonts: {
    script: { family: 'Sacramento', file: 'fonts/Sacramento-Regular.ttf' },
  },

  draw(doc, { options, view, logo }) {
    const left = 30

    drawLogo(doc, logo, {
      align: 'left',
      x: 28,
      top: 17,
      maxWidth: 26,
      maxHeight: 16,
    })

    drawText(doc, options.title, left, 54, {
      size: 32,
      font: 'helvetica',
      style: 'bold',
      color: NAVY,
      align: 'left',
      maxWidth: 240,
    })

    drawText(doc, options.subtitle, left, 62, {
      size: 9,
      font: 'helvetica',
      style: 'bold',
      color: TEAL,
      align: 'left',
      charSpace: 2.2,
      maxWidth: 230,
    })

    doc.setDrawColor(...TEAL)
    doc.setLineWidth(0.9)
    doc.line(left, 68, left + 66, 68)
    doc.setFillColor(...GOLD)
    doc.rect(left + 66, 66.8, 2.4, 2.4, 'F')

    drawText(doc, options.preText, left, 83, {
      size: 12,
      font: 'helvetica',
      color: GRAY,
      align: 'left',
      maxWidth: 230,
    })

    drawText(doc, view.fullName, left, 104, {
      size: 46,
      font: 'Sacramento',
      style: 'normal',
      color: NAVY,
      align: 'left',
      maxWidth: 232,
      minSize: 26,
    })

    if (view.docLine) {
      drawText(doc, view.docLine, left, 116, {
        size: 9,
        font: 'helvetica',
        color: GRAY,
        align: 'left',
        charSpace: 0.4,
        maxWidth: 200,
      })
    }

    doc.setDrawColor(...LIGHT)
    doc.setLineWidth(0.5)
    doc.line(left, 122, 267, 122)

    drawWrappedText(doc, options.bodyText, left, 136, {
      width: 215,
      size: 10.6,
      font: 'helvetica',
      color: GRAY,
      align: 'left',
      lineHeight: 1.55,
    })

    drawSignature(doc, {
      centerX: 66,
      y: 170,
      width: 62,
      text: options.signatureLeft,
      lineColor: LIGHT,
      textColor: NAVY,
      font: 'helvetica',
      style: 'normal',
      fontSize: 10.5,
    })

    drawSignature(doc, {
      centerX: 231,
      y: 170,
      width: 62,
      text: options.signatureRight,
      lineColor: LIGHT,
      textColor: NAVY,
      font: 'helvetica',
      style: 'normal',
      fontSize: 10.5,
    })

    drawText(doc, composeDateLine(options), left, 191, {
      size: 8.6,
      font: 'helvetica',
      color: GRAY,
      align: 'left',
      maxWidth: 220,
    })
  },
}
