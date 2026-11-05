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

La aplicación también se puede instalar como PWA desde un navegador compatible.
Para producción, debe publicarse mediante HTTPS. Después de la primera carga,
el shell de la aplicación queda disponible sin conexión.

## Comandos

```sh
pnpm build    # Genera la versión de producción en dist/
pnpm preview  # Sirve localmente la versión de producción
pnpm lint     # Ejecuta ESLint
```
