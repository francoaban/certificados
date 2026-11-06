# Estilos de certificado

Cuatro variantes de certificado A4 horizontal generadas con **jsPDF**. Cada estilo
declara su fondo, su fuente caligráfica y su propia composición; el resto (datos,
logo, formato de documento, nombre de archivo y exportación) lo resuelve el
generador existente en `src/utils/pdfGenerator.js`.

| id         | Nombre          | Fondo                          | Caligrafía    |
| ---------- | --------------- | ------------------------------ | ------------- |
| `clasico`  | Clásico dorado  | `backgrounds/clasico.svg`      | Great Vibes   |
| `moderno`  | Moderno         | `backgrounds/moderno.svg`      | Sacramento    |
| `elegante` | Elegante        | `backgrounds/elegante.svg`     | Pinyon Script |
| `botanico` | Botánico        | `backgrounds/botanico.svg`     | Parisienne    |

## Uso

El estilo se elige con `options.style` (por defecto `clasico`). Todas las APIs
respetan esa opción:

```js
import {
  DEFAULT_OPTIONS,
  generateCertificate,
  generateBulkPdf,
  generateZip,
  buildPreviewUrl,
} from '../utils/pdfGenerator'

const record = {
  id: 1,
  nombre: 'María José',
  apellido: 'Pérez González',
  docType: 'DNI',
  docNumber: '30123456',
}

await generateCertificate(record, { ...DEFAULT_OPTIONS, style: 'elegante' })
await generateBulkPdf(records, { ...DEFAULT_OPTIONS, style: 'moderno' })
await generateZip(records, { ...DEFAULT_OPTIONS, style: 'botanico' }, onProgress)
const previewUrl = await buildPreviewUrl(record, { ...DEFAULT_OPTIONS, style: 'clasico' })
```

En la interfaz, el selector está en **Configuración → Diseño → Estilo del certificado**.

## Cómo funciona

- `styles/*.js`: cada archivo exporta un objeto con `id`, `name`, `description`,
  `background`, `fonts` y `draw(doc, { options, view, logo })`.
- `shared.js`: utilidades de dibujo (texto ajustado, firmas, logo) y carga de
  recursos. Los SVG se rasterizan a JPEG/PNG y las fuentes TTF se registran en
  jsPDF; ambos se cachean entre certificados.
- `styles/index.js`: registro de estilos y metadatos para el selector.
- `pdfGenerator.js`: prepara fondo, logo y fuentes una sola vez y reutiliza los
  recursos en la vista previa, la exportación individual, el PDF combinado y el ZIP.

Los fondos viven en `public/backgrounds/` y las fuentes en `public/fonts/`. Las
fuentes están incluidas en el precache de la PWA para que la app funcione offline.

## Agregar o personalizar un estilo

1. Copiá un archivo de `styles/` y cambiá `id`, `name`, `description`, `background`,
   `fonts` y el método `draw`.
2. Registralo en `styles/index.js`.
3. Si usás otra fuente TTF, agregala a `public/fonts/` y declarárala en `fonts`:

```js
fonts: {
  script: { family: 'MiFuente', file: 'fonts/MiFuente-Regular.ttf' },
}
```

Para reemplazar solo el fondo sin crear un estilo nuevo, activá
`options.showImageBackground` y asigná `options.imageBackground` con una URL,
un data URL o una ruta de `public/`. Si la opción está desactivada, se usa el
fondo del estilo seleccionado. Para desactivar todo fondo,
`options.useBackground = false`.

La línea de lugar y fecha usa `city`, `province` y `country` según sus opciones
`showCity`, `showProvince` y `showCountry`.

## Notas

- `country` es la opción canónica. Se acepta `contry` al leer configuraciones
  antiguas por compatibilidad.
- El logo es el que ya usa la app: `options.customLogo` o el logo por defecto de
  `src/utils/logo.js`. Se dibuja conservando su relación de aspecto.
- Las fuentes incluidas son SIL Open Font License 1.1; ver `public/fonts/README.md`
  y los archivos `OFL-*.txt` de cada familia.
