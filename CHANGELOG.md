# Changelog

Todos los cambios relevantes de DirectLead se documentan en este archivo.
El formato sigue las convenciones de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.1] - 2026-09-29

### Añadido

### Cambiado

- La ficha muestra los mensajes personalizados con sus variables resueltas.
- WhatsApp utiliza el mensaje guardado en cada prospecto en lugar de reemplazarlo siempre por la plantilla global.
- La hoja del prospecto y la lista se adaptan mejor a la altura y el ancho disponibles.
- El resultado activo de la búsqueda rápida permanece visible al navegar con las flechas.
- Los teléfonos se usan como están guardados; ya no se antepone un código de país predeterminado.

### Corregido

- La sección Configuración vuelve a renderizar correctamente sus entradas.
- El atajo de pantalla completa responde a F11 de forma predeterminada.

## [1.0.0] - 2026-09-29

### Añadido

- Primera versión de DirectLead para Windows x64.
- Alta, búsqueda, edición y eliminación local de prospectos.
- Almacenamiento local con SQLite.
- Plantillas para preparar mensajes de WhatsApp y email.
- Búsqueda rápida, navegación por prospectos y configuración de la aplicación.
- Instalador de Windows creado con electron-builder.
