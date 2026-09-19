# Imagen seleccionada rechazada al enviar

## Diagnóstico (19 de septiembre de 2026)

Reproducido en https://buzonciudadano.lavalleja.uy/ y en un build local del
commit `7dd1217`. El bundle publicado `index-B-XZHGTo.js` contiene el mismo
`setValue("file", ...)` del formulario original.

`react-hook-form` vacía `input.value` al ejecutar `setValue` sobre un campo file
registrado. El ref del formulario se registra de nuevo al renderizar y relee
un FileList vacío. El optimizador conserva su propio File y muestra éxito,
pero Zod rechaza el formulario antes de ejecutar el POST. La prueba de
regresión esperaba `camino.png` y obtuvo `undefined` tanto en producción como
en el build original.

El código implicado existe desde el commit del 4 de junio de 2026. No hay
evidencia suficiente para explicar por qué comenzó a percibirse hace pocos
días: harían falta el historial de despliegues de Coolify y versiones de
navegador de los usuarios afectados. No se atribuye a un cambio reciente de
MinIO sin pruebas. `/health` del backend respondió 200, pero ese endpoint no
comprueba MinIO ni la base de datos.

## Corrección

- Dejar que `register().onChange` capture el FileList nativo, sin reescribirlo
  mediante `setValue`.
- Conservar el archivo ante fallos del servidor y limpiarlo tras un éxito.
- Bloquear archivos cuyo procesamiento falle o cuyo resultado supere 5 MB.
- Avisar de validaciones locales y registrar solamente nombres de campos;
  en errores de envío, registrar estado HTTP y código, sin datos personales.

## Verificación

`npm ci`, `npx playwright install chromium firefox webkit`, `npm run test:e2e`.
La suite compila el frontend real y prueba selección, envío multipart,
ausencia de imagen, reemplazo/reintento, optimización y archivo corrupto.
18 pruebas aprobadas entre Chromium, Firefox y WebKit con viewport móvil.
Todas las peticiones de creación se interceptan; no se crean denuncias reales.
GitHub Actions ejecuta la suite en pushes y pull requests.

El lint general presenta errores preexistentes en Navigation, MapModal y
TicketStatus, ajenos al cambio. El build de producción pasa.

## Despliegue y comprobación

Desplegar este cambio en el recurso frontend de Coolify, conservando sus
variables de build VITE_API_URL y VITE_WHATSAPP_NUMBER. No requiere cambios
de backend, credenciales de MinIO ni migraciones para este fallo.

Después del despliegue, comprobar selección sin enviar datos reales:
`TEST_BASE_URL=https://buzonciudadano.lavalleja.uy npm run test:e2e -- --project=chromium -g preserves`
(En PowerShell, asignar `$env:TEST_BASE_URL` antes de ejecutar npm.)
Una verificación integral de almacenamiento requiere un envío controlado y
revisar el adjunto en administración. Esta suite simula el backend y no
certifica la disponibilidad de MinIO en producción.

Se recomienda exigir el check `browser-tests` como protección de main y
desplegar únicamente revisiones verificadas. La suite previene esta
regresión; no garantiza ausencia de futuras averías de infraestructura.
