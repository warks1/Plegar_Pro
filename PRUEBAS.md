# Pruebas y límites conocidos — Plegar Pro

## Comprobaciones automatizadas

El flujo de GitHub Actions ejecuta comprobaciones de sintaxis JavaScript, contratos de sincronización y geometría paramétrica, y una prueba de humo del navegador para arranque, canvas 3D y navegación a colisiones.

## Verificación manual pendiente

- Probar en móvil y escritorio cada selector de fabricante, punzón y matriz.
- Ejecutar todos los botones de selección, reordenación, duplicado y edición de filas de cada módulo.
- Comprobar reproducción, pausa, reinicio y avance/retroceso entre 2D, 3D, gemelo digital y revisión de colisiones.
- Confirmar que cada selector conserva una etiqueta visible cuando no hay opciones de catálogo.
- Repetir las pruebas con datos de proyecto guardados antiguos y con caché de navegador previa.

## Limitaciones de seguridad

Una prueba de humo no demuestra que todos los botones tengan una acción funcional. La geometría paramétrica y los modelos visuales no constituyen un CAD industrial certificado ni autorizan la liberación de un programa CNC.
