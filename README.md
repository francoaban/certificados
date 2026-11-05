# Generador de certificados

Aplicación web para generar certificados PDF a partir de planillas Excel o CSV.

## Requisitos

- Node.js
- pnpm 11.10.0

La versión de pnpm está declarada en `package.json`.

## Desarrollo

Instalá las dependencias y levantá el servidor local:

```sh
pnpm install
pnpm dev
```

## Uso sin conexión

Generá la versión instalable con `pnpm build` y publicá el contenido de `dist/`
en un sitio HTTPS. Abrí el sitio una vez con conexión y esperá a que termine
la carga inicial; después podés instalarlo desde el navegador. El service worker
guarda los archivos de la aplicación para abrirla y generar certificados sin
internet. En iOS, usá “Añadir a pantalla de inicio” desde Safari.

La instalación o actualización de dependencias de desarrollo requiere descargar
paquetes (o tenerlos previamente en la caché local de pnpm); no es necesaria
para usar la aplicación ya compilada e instalada.

## Comandos

```sh
pnpm build    # Genera la versión de producción en dist/
pnpm preview  # Sirve localmente la versión de producción
pnpm lint     # Ejecuta ESLint
```
