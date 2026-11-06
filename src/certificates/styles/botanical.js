import {
  PAGE_WIDTH,
  composeDateLine,
  drawCenteredText,
  drawDiamond,
  drawLogo,
  drawSignature,
  drawWrappedText,
} from '../shared.js'

const FOREST = [61, 74, 53]
const INK = [90, 98, 80]
const SAGE = [111, 127, 90]
const SAGE_LIGHT = [176, 188, 155]
const LINE = [183, 192, 166]

/**
 * Estilo 4 — Botánico.
 * Fondo marfil con hojas de salvia y nombre en Parisienne.
 */
export const botanicalStyle = {
  id: 'botanico',
  name: 'Botánico',
  description: 'Fondo marfil con hojas de salvia y caligrafía Parisienne.',
  background: 'backgrounds/botanico.svg',
  fonts: {
    script: { family: 'Parisienne', file: 'fonts/Parisienne-Regular.ttf' },
  },

  draw(doc, { options, view, logo }) {
    const centerX = PAGE_WIDTH / 2

    drawLogo(doc, logo, { centerX, top: 15, maxWidth: 26, maxHeight: 16 })

    drawCenteredText(doc, options.title, 52, {
      size: 30,
      font: 'times',
      style: 'bold',
      color: FOREST,
      charSpace: 2.4,
      maxWidth: 250,
    })

    drawCenteredText(doc, options.subtitle, 60.5, {
      size: 9,
      font: 'helvetica',
      color: SAGE,
      charSpace: 2.2,
      maxWidth: 240,
    })

    doc.setDrawColor(...SAGE_LIGHT)
    doc.setLineWidth(0.35)
    doc.line(centerX - 42, 66.5, centerX + 42, 66.5)
    drawDiamond(doc, centerX, 66.5, 1.9, SAGE)
    doc.setFillColor(...SAGE_LIGHT)
    doc.circle(centerX - 46, 66.5, 1.1, 'F')
    doc.circle(centerX + 46, 66.5, 1.1, 'F')

    drawCenteredText(doc, options.preText, 82, {
      size: 12.5,
      font: 'times',
      style: 'italic',
      color: INK,
      maxWidth: 230,
    })

    drawCenteredText(doc, view.fullName, 104, {
      size: 47,
      font: 'Parisienne',
      style: 'normal',
      color: FOREST,
      maxWidth: 215,
      minSize: 26,
    })

    if (view.docLine) {
      drawCenteredText(doc, view.docLine, 116, {
        size: 9,
        font: 'helvetica',
        color: SAGE,
        charSpace: 0.4,
        maxWidth: 200,
      })
    }

    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.3)
    doc.line(centerX - 70, 121.5, centerX + 70, 121.5)

    drawWrappedText(doc, options.bodyText, centerX, 136, {
      width: 184,
      size: 11,
      font: 'times',
      color: INK,
      lineHeight: 1.5,
    })

    drawSignature(doc, {
      centerX: 80,
      y: 168,
      width: 58,
      text: options.signatureLeft,
      lineColor: LINE,
      textColor: FOREST,
      font: 'times',
      style: 'italic',
      fontSize: 11,
    })

    drawSignature(doc, {
      centerX: 217,
      y: 168,
      width: 58,
      text: options.signatureRight,
      lineColor: LINE,
      textColor: FOREST,
      font: 'times',
      style: 'italic',
      fontSize: 11,
    })

    drawCenteredText(doc, composeDateLine(options), 192, {
      size: 9,
      font: 'times',
      style: 'italic',
      color: SAGE,
      maxWidth: 220,
    })
  },
}
