# Plegar Pro — guía técnica de mantenimiento

## 1. Estructura actual

La aplicación se sirve como sitio estático desde GitHub Pages. El punto de entrada es `index.html`; los módulos JavaScript externos se cargan desde el HTML y el service worker `sw.js` mantiene recursos para uso con caché.

Módulos externos detectados en el repositorio:

- `pp54-engineering.js`: utilidades de ingeniería y programación.
- `pp55-cad-precision.js`: precisión CAD y geometría.
- `pp56-collision-review.js`: revisión y animación de colisiones.
- `pp57-system-integration.js`: integración entre módulos.
- `pp59-engineering-upgrade.js`: mejoras de ingeniería.
- `pp60-graphics-runtime.js`: runtime gráfico.
- `pp61-runtime-integrity.js`: comprobaciones de integridad.
- `pp62-contrast-playback-fix.js`: contraste y reproducción.
- `pp63-v85-parametric-model.js`: modelo paramétrico de referencia V85.
- `pp64-ai-voice.js`: funciones de voz/ayuda.

La lista efectiva debe confirmarse en el `index.html` de la rama que se vaya a publicar; los nombres de módulos internos no equivalen a la versión comercial de la aplicación.

## 2. Publicación y caché

1. Los cambios se preparan en una rama y se revisan mediante pull request.
2. La validación automatizada debe pasar antes de integrar el cambio.
3. El flujo de GitHub Pages debe terminar correctamente después de la integración.
4. Si se modifican recursos estáticos, actualizar las referencias y la estrategia de caché del service worker de forma coordinada.
5. Probar la URL publicada en ventana privada y en una sesión con caché anterior.

No publicar una versión basándose únicamente en que el código compila. La carga de recursos, el arranque, la navegación y el renderizado del canvas deben comprobarse en navegador.

## 3. CSS: política de limpieza conservadora

El HTML principal contiene una cascada CSS extensa con capas históricas y correcciones posteriores. El análisis estático previo detectó bloques repetidos y selectores coincidentes; eso no significa automáticamente que el CSS sea redundante, porque el orden, la especificidad y los `@media` cambian el resultado.

Reglas de mantenimiento:

- No eliminar reglas solo porque repitan selector o declaración.
- Mantener identificadores únicos en los bloques `<style id="...">` que tengan nombre.
- Preservar las capas críticas `pp70-program2d-clear-canvas`, `pp649-stability-core` y `pp70-light-readable-panels` hasta demostrar equivalencia visual.
- No alterar el comportamiento del lienzo de Programación 2D al cambiar overlays, z-index, eventos de puntero o touch.
- Hacer una sola clase de cambio por pull request: CSS, lógica de secuencia o documentación, sin mezclarlas cuando no sea necesario.
- Para retirar CSS, capturar antes/después y probar los estados y breakpoints afectados.

La consolidación correcta debe basarse en cobertura de estados reales del navegador, no en deduplicación textual.

## 4. Pruebas automatizadas

El workflow `.github/workflows/validate-plegar-pro.yml` incluye validaciones de sintaxis/recursos, contratos y una prueba de humo de navegador. La suite `tests/collision-contract.test.cjs` contiene aserciones sobre sincronización, geometría, recursos y restricciones visuales conocidas.

La prueba de humo no equivale a cobertura completa de todos los controles. Un resultado correcto tampoco certifica una máquina, un utillaje ni un programa CNC.

Antes de fusionar:
- [ ] Sintaxis de todos los JavaScript modificados.
- [ ] Rutas y recursos locales válidos.
- [ ] Identificadores HTML y referencias de scripts únicos.
- [ ] Contratos de sincronización y secuencia superados.
- [ ] Arranque, navegación, canvas 3D y revisión de colisiones superados en navegador.
- [ ] Sin desbordamiento horizontal en móvil.
- [ ] Publicación de Pages comprobada tras la integración.

## 5. Prioridades de ingeniería

### P0 — fiabilidad y seguridad de datos
- Sincronizar una única fuente de verdad para orden de pliegues, geometría y parámetros de pieza.
- Añadir casos de prueba para cambio de secuencia, borrado de un pliegue, reinicio de reproducción y cambio de módulo.
- Evitar que un fallo de un módulo se presente como una simulación válida.
- Identificar claramente datos medidos, datos oficiales, valores estimados y geometría ilustrativa.

### P1 — regresión visual y accesibilidad
- Capturas de referencia de escritorio, tablet y móvil.
- Contraste de texto, foco de teclado, botones táctiles y controles sin etiquetas.
- Pruebas para menús, paneles informativos, lienzos y avisos de datos ausentes.
- Verificación de movimiento reducido y transiciones breves.

### P2 — CSS mantenible
- Inventario de reglas no utilizadas con cobertura de las rutas de la aplicación.
- Consolidación por componente y breakpoint, en cambios pequeños.
- Retirada de una capa antigua solo después de probar que la capa actual la reemplaza.

### P3 — documentación y diagnóstico
- Manual de usuario y lista previa a fabricación.
- Guía de arquitectura y publicación.
- Registro de incidencias reproducibles y tabla de resultados por navegador/dispositivo.

## 6. Datos técnicos y geometría

Las dimensiones de las máquinas y herramientas deben incluir fuente, modelo exacto, variante, fecha y unidades. Una ficha de catálogo de otra generación no valida la geometría de una máquina de 2006.

Para modelos de máquina:
- Registrar fabricante, modelo, año, número de serie cuando se conozca y fuente de cada cota.
- Marcar explícitamente las cotas no verificadas.
- No presentar un modelo paramétrico como réplica oficial.
- No afirmar que la detección de colisiones cubre todos los contactos, deformaciones, límites de carrera o configuraciones reales.

## 7. Criterio de cierre

Plegar Pro solo debe considerarse listo para una versión estable cuando:
1. La validación automatizada pasa en el commit candidato.
2. El despliegue de Pages termina correctamente.
3. Las rutas críticas se prueban en navegador de escritorio y móvil.
4. La secuencia de plegado coincide entre programación, reproducción y colisiones.
5. Las limitaciones de precisión y seguridad quedan visibles para el usuario.
6. Las referencias de máquinas y herramientas usadas para una liberación industrial se han contrastado con documentación oficial.
