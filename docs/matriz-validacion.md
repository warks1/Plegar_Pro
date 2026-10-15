# Plegar Pro — matriz de validación de regresión

Esta matriz separa lo que comprueban los tests automáticos de lo que requiere inspección manual. Marcar una prueba como aprobada únicamente después de ejecutarla en la versión candidata indicada.

## Entornos

| Entorno | Resolución o condición | Estado |
|---|---|---|
| Escritorio | 1366 × 768 o superior | Pendiente de revisión manual completa |
| Tablet | orientación vertical y horizontal | Pendiente |
| Móvil | 390 px de ancho | Existe cobertura automatizada parcial; falta inspección visual completa |
| Móvil estrecho | 320–360 px de ancho | Pendiente |
| Caché anterior | service worker de versión previa | Pendiente de regresión manual |

## Casos funcionales

| ID | Área | Acción | Resultado esperado | Evidencia |
|---|---|---|---|---|
| NAV-01 | Navegación | Abrir cada módulo desde el menú | El módulo correcto se muestra y el menú responde con rapidez | Captura por módulo |
| START-01 | Inicio | Abrir la URL publicada desde sesión limpia | La pantalla de carga termina y aparece la aplicación | Vídeo o captura con tiempo |
| P2D-01 | Programación 2D | Marcar un pliegue | Se asigna el número de orden en la geometría seleccionada | Captura antes/después |
| P2D-02 | Programación 2D | Volver a pulsar el pliegue marcado | Se elimina o alterna su selección según el comportamiento aprobado | Captura |
| P2D-03 | Programación 2D | Pulsar cerca de los bordes y del panel informativo | El panel no bloquea la selección de la geometría | Captura |
| SEQ-01 | Secuencia | Crear una secuencia de al menos tres pliegues | Los números y el orden de ejecución coinciden | Capturas 2D/3D |
| SEQ-02 | Secuencia | Cambiar y borrar un pliegue de la secuencia | Todos los módulos reflejan el nuevo orden | Capturas de cada módulo |
| PLAY-01 | Reproducción | Iniciar, pausar, reiniciar y avanzar/retroceder | El estado de reproducción y el paso visible se mantienen coherentes | Grabación |
| CAD-01 | Herramientas | Cambiar fabricante, punzón y matriz | Etiquetas, geometría y dimensiones se actualizan sin opciones fantasma | Captura |
| CAD-02 | Herramientas | Seleccionar una matriz incompatible o no disponible | La aplicación informa de la falta de opción y no inventa compatibilidad | Captura |
| COL-01 | Colisiones | Reproducir cada paso en revisión de colisiones | Chapa, trancha, herramientas y topes siguen el paso seleccionado | Grabación |
| COL-02 | Colisiones | Girar, ampliar y cambiar cámara | La cámara responde y la escena no desaparece ni queda fuera del panel | Captura |
| DXF-01 | Importación | Importar un DXF de escala conocida | Unidades, contorno y escala se conservan o se informa del problema | Archivo de prueba y captura |
| RES-01 | Responsive | Abrir a 390 px y a 320–360 px | No hay desplazamiento horizontal global ni controles inaccesibles | Capturas |
| CACHE-01 | Caché | Actualizar desde una versión previa | HTML, módulos y service worker quedan en una misma versión coherente | Consola/red |
| DATA-01 | Datos | Abrir un proyecto antiguo o con campos incompletos | La aplicación informa de los datos ausentes y no rompe la navegación | Archivo anonimizado |

## Registro de ejecución

| Fecha | Commit/versión | Entorno | Casos ejecutados | Resultado | Incidencias |
|---|---|---|---|---|---|
| — | — | — | — | Pendiente | — |

## Criterio de aceptación

- Ningún caso P0 (arranque, secuencia, sincronización o colisiones) puede quedar fallido.
- Cualquier fallo visual se reproduce con pasos claros y se corrige antes de retirar CSS antiguo.
- No se interpreta la ausencia de una colisión gráfica como certificación de seguridad.
- Los casos no ejecutados permanecen como pendientes; no se marcan aprobados por inferencia.
