# Registro de cambios consolidado — Plegar Pro

## v64.11 — higiene conservadora del repositorio

- Se revisaron los archivos raíz y las referencias de módulos: no hay archivos JavaScript duplicados ni referencias de script repetidas en el HTML.
- Se conserva el orden de las capas CSS existentes porque forman parte de la cascada visual; no se eliminan reglas solo por compartir selectores sin comprobar el resultado visual.
- La documentación y las pruebas automatizadas quedan alineadas con la versión publicada v64.10.


## v64.10 — restauración de interfaz anterior

- Se retiró únicamente la última capa CSS experimental «Plegar Pro Premium» a petición del usuario; se mantiene la interfaz previa.
- No se eliminaron módulos, lógica de simulación ni datos del proyecto.
- Validación de sintaxis, contratos de colisión, prueba de navegador y publicación de GitHub Pages completadas correctamente para esta reversión.

## v64.9 — estabilización de interfaz y navegación

- Se protege la navegación cuando una sección dinámica no tiene metadatos en la tabla de títulos.
- Los fallos de actualización de un módulo dejan de quedar ocultos: se registran en consola y se muestra un aviso al usuario.
- Se mejora el contraste del panel de control, sus accesos rápidos y los KPI.
- Se refuerza el contraste y el ajuste de etiquetas, selectores y acciones en Revisión de colisiones.
- Los selectores de herramientas muestran un mensaje explícito cuando no existen matrices para la abertura V seleccionada.
- Se invalidó la caché del navegador para publicar los estilos corregidos de colisiones.

## v64.8 y anteriores

Los archivos históricos `CHANGELOG_v*.txt` y `PRUEBAS_v*.txt` se conservan para trazabilidad. No deben interpretarse como identificadores de versión actual de la aplicación.

## Límites conocidos

- Las geometrías de máquina son referencias visuales paramétricas, no modelos CAD oficiales verificados.
- Las pruebas automáticas comprueban sintaxis, contratos internos, algunos casos de geometría y arranque/navegación del navegador; no certifican todas las acciones de la interfaz ni la seguridad de una plegadora real.
- La revisión de colisiones no sustituye a un sistema de colisión CAD completo ni a la validación de utillaje, máquina y programa CNC por personal cualificado.
