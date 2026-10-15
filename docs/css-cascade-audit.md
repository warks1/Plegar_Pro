# Plegar Pro — mapa de la cascada CSS

Auditoría de `index.html` en `main` tras la PR #38. Este documento es una guía para una limpieza incremental; no sustituye la validación visual en navegador.

## Estado medido

- 29 bloques `<style>` en el HTML principal.
- Aproximadamente 1.032 reglas CSS detectadas con un análisis estático sencillo.
- 19 reglas normalizadas exactas aparecen en más de un bloque.
- Hay reglas repetidas dentro de bloques que pueden pertenecer a distintos `@media`; no deben eliminarse con una deduplicación basada únicamente en texto.
- Los scripts externos tienen URLs únicas, protegidas por una prueba automatizada.

## Mapa de bloques por función aparente

| Bloque | Papel / riesgo |
|---|---|
| Primer bloque sin ID | Estilos base y responsive. Contiene algunas reglas repetidas dentro de contextos distintos; revisar por media query antes de editar. |
| `pp515-visual-upgrade` | Capa visual antigua oscura. Puede seguir aportando reglas de componentes que no se hayan redefinido después. |
| `v519-mobile-stability` | Ajustes de tamaño de texto y estabilidad móvil. |
| `pp524-style` | KPIs. |
| `pp531-splash-style` | Animación/estilos de inicio. |
| `pp55-base-style` | Ajustes de sombras y controles del tema claro. |
| `pp57-industrial-shell` | Shell industrial y responsive; incluye reglas repetidas dentro del mismo bloque en contextos que requieren inspección. |
| `pp64-visual-redesign` | Capa visual oscura anterior; algunas reglas de animación o componentes pueden seguir siendo relevantes. |
| `pp69-fold-data-readability-motion` | Legibilidad y movimiento en programación. |
| `pp70-contrast-motion-repair` | Contraste y correcciones de movimiento. |
| `pp71-global-readable-info-panels` | Legibilidad de paneles informativos. |
| `pp61-fast-menu-and-twin-visibility` | Transiciones de menú y visibilidad del gemelo de máquina. |
| `pp69-loader-scroll-lock` | Bloqueo de scroll durante la carga. |
| `pp70-startup-rescue-style` | Rescate visual de la pantalla de inicio. |
| `pp649-stability-core` | Estabilidad visual de la pantalla principal. |
| `pp70-program2d-clear-canvas` | Oculta el overlay informativo que interfería con la selección de pliegues 2D. No retirar sin una prueba equivalente. |
| Bloques 17–20 | Ajustes de móvil, estabilidad profesional, estilos de revisiones y componentes auxiliares. |
| `pp57-visual-polish` | Pulido de interfaz y carga. |
| `pp60-responsive-final` | Ajustes responsive finales. |
| `pp61-visibility-and-menu` | Visibilidad y menú. |
| `pp62-industrial-workspace` | Paneles claros del espacio de trabajo. |
| `pp63-loader-wordmark-fix` | Oculta el texto de marca en la pantalla de carga. |
| `pp65-banner-contrast-fix` | Correcciones de contraste de banners y paneles. |
| `pp66-force-banner-contrast` | Correcciones de contraste específicas, incluidas colisiones. |
| `pp69-readable-panel-contrast` | Últimas correcciones de contraste de paneles. |
| `pp70-light-readable-panels` | Capa visual final declarada: paneles claros, texto legible, menú ligero, responsive y ajustes de simulación. Es una capa extensa; dividir por componentes requiere regresión visual. |

## Orden seguro de consolidación

1. Mantener la capa final y el bloqueo de overlay 2D hasta que exista una prueba visual que demuestre equivalencia.
2. Añadir pruebas de contrato para navegación, programación 2D, lienzo 3D y colisiones antes de retirar reglas antiguas.
3. Revisar cada bloque oscuro por selector y por contexto `@media`; trasladar solo reglas cuyo comportamiento esté cubierto por la capa final.
4. Consolidar un módulo por PR, sin cambiar HTML/JavaScript funcional en el mismo cambio.
5. Ejecutar validación de sintaxis, contrato y navegador en cada PR; revisar escritorio y móvil antes de fusionar.
6. No eliminar reglas porque el selector se repita: una repetición puede ser intencional por especificidad, orden de cascada o breakpoint.

## Limitaciones de esta auditoría

El conteo es estático y deliberadamente conservador. No determina qué regla gana en cada página, ni confirma por sí mismo que un bloque sea prescindible. Para identificar CSS muerto de forma fiable se necesita cobertura de las rutas y estados reales de la aplicación en navegador.
