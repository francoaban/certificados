/**
 * Opciones por defecto para la generación de certificados.
 * Las cuatro variantes (clásico, moderno, elegante y botánico) comparten
 * esta configuración; el estilo se elige con `style`.
 */
export const DEFAULT_OPTIONS = {
  title: 'CERTIFICADO',
  subtitle: 'DE RECONOCIMIENTO',
  preText: 'Se otorga el presente certificado a',
  bodyText: 'Por su destacada participación y compromiso, otorgándose el presente en reconocimiento a su dedicación y esfuerzo.',
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
  city: 'San Salvador de Jujuy',
  showCity: true,
  province: 'Jujuy',
  showProvince: false,
  country: 'Argentina',
  showCountry: false,
  imageBackground: null, // URL o data URL para reemplazar el fondo del estilo
  showImageBackground: false, // si false, ignora `background` y el fondo del estilo

  // --- Diseño ---
  style: 'clasico', // clasico | moderno | elegante | botanico
  useBackground: true,
  background: null, // URL o data URL para reemplazar el fondo del estilo
}
