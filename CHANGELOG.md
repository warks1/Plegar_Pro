# Registro de cambios consolidado — Plegar Pro

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
