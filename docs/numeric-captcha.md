# Captcha numérico antes del envío

Requiere el backend con GET /api/captcha y validación de captcha_id/captcha_answer.
No desplegar este frontend contra el backend anterior: no conoce estos campos.

La suma aparece al final, antes de Enviar Reporte. Se puede renovar; el campo
usa teclado numérico en móviles y una etiqueta accesible. No se calcula ni
acepta la respuesta correcta en el frontend: decide el servidor. Cada desafío
dura 10 minutos y solo puede crear una denuncia. Si vence o se responde mal,
se renueva sin borrar datos, ubicación ni foto. Si no se puede cargar, se
ofrece reintento y se bloquea el envío hasta recuperar la verificación.

## Orden de despliegue

1. Desplegar primero el backend y su migración con CAPTCHA_REQUIRED=false.
2. Confirmar GET /api/captcha, desplegar este frontend conservando VITE_API_URL.
3. Activar CAPTCHA_REQUIRED=true en backend y verificar el envío controlado
   con foto. Las páginas antiguas abiertas deben recargarse.

La opción temporal false permite que la versión anterior funcione durante la
actualización; el frontend nuevo siempre envía captcha y el backend siempre
valida los desafíos enviados. No dejar false como configuración definitiva.
El procedimiento completo y reversión están en docs/numeric-captcha.md del
repositorio backend.

## Verificación realizada

- Build de producción, lint de archivos modificados sin errores.
- 27 pruebas de navegador: regresión de imágenes, captcha obligatorio, errores
  del servidor, renovación, caída del endpoint y conservación del formulario.
- 3 pruebas integradas en Chromium, Firefox y WebKit móvil contra Flask real:
  captcha incorrecto, envío con imagen y rechazo de reutilización.
- 13 pruebas backend, incluyendo migración y reversión sin perder un ticket.

`npm run test:e2e` ejecuta las pruebas de navegador con API simulada. Para probar
integración, iniciar `python -m tests.serve_integration` desde el backend y
definir VITE_API_URL e INTEGRATION_API_URL como http://127.0.0.1:5001 antes de
ejecutar `npm run test:e2e -- tests/captcha-integration.spec.ts`.
MinIO y correo son simulados; no se han creado denuncias en producción.
