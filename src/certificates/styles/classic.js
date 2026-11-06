import {
  PAGE_WIDTH,
  composeDateLine,
  drawCenteredText,
  drawDiamond,
  drawLogo,
  drawSignature,
  drawWrappedText,
} from '../shared.js'

const INK = [27, 42, 74]
const GOLD = [169, 133, 58]
const GOLD_SOFT = [201, 176, 112]
const MUTED = [122, 115, 104]

/**
 * Estilo 1 — Clásico dorado.
 * Marco ornamental, tipografía serif y nombre en Great Vibes.
 */
export const classicStyle = {
  id: 'clasico',
  name: 'Clásico dorado',
  description: 'Marco dorado, texto serif y caligrafía Great Vibes.',
  background: 'backgrounds/clasico.svg',
  fonts: {
    script: { family: 'GreatVibes', file: 'fonts/GreatVibes-Regular.ttf' },
  },

  draw(doc, { options, view, logo }) {
    const centerX = PAGE_WIDTH / 2

    drawLogo(doc, logo, { centerX, top: 14, maxWidth: 26, maxHeight: 16 })

    drawCenteredText(doc, options.title, 50, {
      size: 31,
      font: 'times',
      style: 'bold',
      color: INK,
      charSpace: 2.6,
      maxWidth: 250,
    })

    drawCenteredText(doc, options.subtitle, 59, {
      size: 9.5,
      font: 'helvetica',
      color: GOLD,
      charSpace: 2.1,
      maxWidth: 240,
    })

    doc.setDrawColor(...GOLD_SOFT)
    doc.setLineWidth(0.35)
    doc.line(centerX - 42, 65, centerX + 42, 65)
    drawDiamond(doc, centerX, 65, 2.1, GOLD)

    drawCenteredText(doc, options.preText, 81, {
      size: 13,
      font: 'times',
      style: 'italic',
      color: MUTED,
      maxWidth: 230,
    })

    drawCenteredText(doc, view.fullName, 103, {
      size: 44,
      font: 'GreatVibes',
      style: 'normal',
      color: INK,
      maxWidth: 220,
      minSize: 26,
    })

    if (view.docLine) {
      drawCenteredText(doc, view.docLine, 115.5, {
        size: 9,
        font: 'helvetica',
        color: MUTED,
        charSpace: 0.5,
        maxWidth: 200,
      })
    }

    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.3)
    doc.line(centerX - 75, 121, centerX + 75, 121)
    drawDiamond(doc, centerX, 121, 1.6, GOLD)

    drawWrappedText(doc, options.bodyText, centerX, 135.5, {
      width: 186,
      size: 11.2,
      font: 'times',
      color: MUTED,
      lineHeight: 1.5,
    })

    drawSignature(doc, {
      centerX: 76,
      y: 167,
      width: 62,
      text: options.signatureLeft,
      lineColor: GOLD_SOFT,
      textColor: INK,
      font: 'times',
      style: 'italic',
      fontSize: 11.5,
    })

    drawSignature(doc, {
      centerX: 221,
      y: 167,
      width: 62,
      text: options.signatureRight,
      lineColor: GOLD_SOFT,
      textColor: INK,
      font: 'times',
      style: 'italic',
      fontSize: 11.5,
    })

    drawCenteredText(doc, composeDateLine(options), 193.5, {
      size: 9,
      font: 'times',
      style: 'italic',
      color: MUTED,
      maxWidth: 220,
    })
  },
}
