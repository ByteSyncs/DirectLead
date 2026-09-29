# Política de Privacidad de DirectLead

**Estado:** Borrador para revisión legal. No publicar como versión definitiva sin validar la identidad del responsable, la distribución de la aplicación y la legislación aplicable.

**Última actualización:** 28 de septiembre de 2026

## 1. Alcance

Esta política describe el tratamiento de información dentro de la aplicación de escritorio DirectLead. No reemplaza la Política de Privacidad del sitio `bytesyncs.com`, que tiene un alcance distinto.

DirectLead está diseñada para funcionar localmente. En la versión actual no requiere una cuenta, no sincroniza prospectos con servidores de ByteSyncs y el código revisado no implementa analítica ni telemetría.

Si una versión futura ofrece guardar o sincronizar información en una base de datos remota, esa función no se activará silenciosamente: antes de transmitir datos, DirectLead deberá explicar qué información se enviará, con qué finalidad, dónde y por cuánto tiempo se conservará, y solicitar una aceptación afirmativa. Si la persona usuaria no acepta, la sincronización permanecerá desactivada y los datos seguirán en el dispositivo. La pantalla de consentimiento y esta política deberán actualizarse antes de habilitar esa función.

## 2. Responsable y roles

DirectLead es desarrollada y distribuida bajo la marca ByteSyncs, operada por Ezequiel Saucedo, con domicilio informado en Buenos Aires, Argentina. Contacto: [info@bytesyncs.com](mailto:info@bytesyncs.com).

La persona o empresa que instala y utiliza DirectLead decide qué prospectos registra y para qué los contacta. Esa persona o empresa es responsable de contar con una base legítima para recopilar y utilizar los datos de sus contactos, informarles cuando corresponda y atender sus solicitudes. ByteSyncs no recibe automáticamente el contenido de la base local ni determina esos fines.

## 3. Información que puede almacenarse

Según los datos que la persona usuaria ingrese, DirectLead puede guardar:

- Nombre del negocio, teléfono, email y enlace asociado.
- Mensaje de contacto y notas.
- Fecha de contacto y marcas de creación y actualización del registro.
- Preferencias, como el nombre del negocio propio, plantillas, canal de WhatsApp, asunto y remitente de email, atajos de teclado y ancho de la lista.

La persona usuaria debe evitar guardar datos sensibles o información que no sea necesaria para su actividad.

## 4. Almacenamiento y conservación

Los prospectos se almacenan en una base SQLite local llamada `directlead.db`, dentro del directorio de datos de usuario que administra Electron en el dispositivo. Las preferencias se guardan en el almacenamiento local del perfil de la aplicación.

Los registros permanecen hasta que la persona usuaria los elimina desde DirectLead o elimina los datos locales de la aplicación en el sistema operativo. Desinstalar la aplicación puede no borrar ese directorio. La persona usuaria es responsable de proteger el dispositivo y de realizar sus propias copias de seguridad; DirectLead no ofrece actualmente una copia en la nube ni recuperación remota.

## 5. Uso de la información

DirectLead utiliza la información localmente para mostrar, buscar, editar y eliminar prospectos, y para preparar mensajes personalizados. Las preferencias se utilizan para completar plantillas y ajustar el comportamiento de la interfaz.

## 6. Enlaces y aplicaciones de terceros

Cuando la persona usuaria elige abrir WhatsApp, email o un enlace guardado, DirectLead entrega la información necesaria a la aplicación o servicio externo seleccionado:

- WhatsApp puede recibir el número de teléfono y el texto del mensaje mediante WhatsApp Web o WhatsApp Desktop.
- La aplicación de correo puede recibir el destinatario, el asunto y el cuerpo mediante un enlace `mailto:`.
- El navegador o servicio correspondiente recibe la solicitud al abrir un enlace del prospecto.

Esos terceros procesan la información conforme a sus propias políticas y condiciones. ByteSyncs no controla sus servicios ni sus prácticas. La apertura solo ocurre como resultado de una acción de la persona usuaria.

## 7. Comunicaciones con ByteSyncs

DirectLead no envía automáticamente la base local a ByteSyncs. Si la persona usuaria comparte voluntariamente información con ByteSyncs —por ejemplo, al solicitar soporte— esa información se tratará para responder la consulta. No envíes la base de prospectos completa salvo que sea estrictamente necesario y hayas eliminado o protegido los datos de terceros.

## 8. Seguridad

Los datos se guardan en el dispositivo y su protección depende también de la seguridad del sistema operativo, la cuenta de usuario, el almacenamiento y las copias de respaldo. Ningún método de almacenamiento garantiza seguridad absoluta. Se recomienda mantener el dispositivo actualizado y protegido mediante bloqueo de acceso.

## 9. Derechos y consultas

Las solicitudes relacionadas con datos que una persona usuaria guardó en su propia instalación deben dirigirse primero a esa persona o empresa, ya que ByteSyncs no tiene acceso remoto a esa base local. Para consultas sobre esta política o sobre la aplicación, escribe a [info@bytesyncs.com](mailto:info@bytesyncs.com).

Cuando corresponda la legislación argentina de protección de datos personales, podrán resultar aplicables los derechos de acceso, rectificación, actualización y supresión previstos por la Ley 25.326 y sus normas complementarias. La aplicación no puede ejercer esos derechos por cuenta de cada persona usuaria respecto de los prospectos que esta registra.

## 10. Cambios y nuevas funciones

Esta política debe actualizarse si DirectLead incorpora cuentas, sincronización, analítica, copias en la nube, nuevos proveedores o cualquier otro tratamiento distinto del descrito. La fecha de actualización se modificará junto con cada cambio sustancial. Si se incorpora sincronización remota, también se informará cómo retirar el consentimiento y cómo solicitar la eliminación de las copias remotas, cuando corresponda.
