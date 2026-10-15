# Plegar Pro — manual de usuario

## 1. Propósito y límites

Plegar Pro ayuda a preparar geometría de chapa, estimar desarrollo, comparar aberturas V y visualizar una secuencia de plegado. Es una aplicación web estática: se abre desde GitHub Pages y no requiere instalar un servidor local.

**Importante:** las vistas paramétricas de máquinas y herramientas son referencias visuales, no modelos CAD certificados. Los resultados de cálculo, radios, fuerzas y colisiones deben contrastarse con los planos reales de la máquina, el utillaje y la primera pieza. No se debe enviar un programa a una plegadora real basándose únicamente en la simulación.

## 2. Inicio y navegación

1. Abre https://warks1.github.io/Plegar_Pro/.
2. Espera a que termine la pantalla de inicio. Si se queda bloqueada, recarga la página; si persiste, prueba una ventana privada para descartar una caché antigua.
3. Entra en el módulo desde el menú lateral. En móviles, el menú puede mostrarse como un panel desplegable.
4. Si ves estilos antiguos tras una publicación, cierra y vuelve a abrir la página. El service worker puede conservar recursos de una versión anterior.

## 3. Flujo recomendado de trabajo

### A. Preparar la pieza

- Introduce el material, espesor, dimensiones y geometría conocida.
- Comprueba las unidades y el sentido de las cotas antes de calcular.
- Si importas un DXF, revisa la escala, el contorno y las unidades; no des por válida la importación solo porque se haya dibujado.

### B. Estimar el desarrollo

- Utiliza la calculadora BA/BD con el espesor, radio interior, ángulo y factor K que correspondan.
- Si dispones de una pieza de prueba, mide el desarrollo y las cotas finales con instrumentos adecuados y calibra el factor K con medidas coherentes.
- Registra si un dato procede de una ficha técnica, una medición o una estimación. No mezcles medidas interiores y exteriores sin ajustar el método de cálculo.

### C. Elegir matriz y punzón

- Selecciona fabricante, punzón y matriz disponibles en los catálogos.
- Comprueba el ángulo de la herramienta, la abertura V, el radio de punta, la altura y las longitudes de montaje.
- Si el selector no ofrece la herramienta necesaria, no la sustituyas por una herramienta “parecida” sin verificar compatibilidad.

### D. Definir el orden de plegado

- En Programación 2D/3D, selecciona directamente la línea o zona de pliegue para asignar su número de orden.
- Vuelve a seleccionar el pliegue para quitar su número cuando el módulo lo permita.
- Revisa que la secuencia resultante sea la prevista antes de reproducirla.
- Compara el mismo orden en la vista 2D, la vista 3D y la revisión de colisiones. Si algún módulo muestra otro orden, detén la validación y registra el caso.

### E. Revisar la simulación y las colisiones

- Reproduce la secuencia paso a paso; utiliza pausa, reinicio y avance/retroceso cuando estén disponibles.
- Gira y amplía la vista para inspeccionar la chapa, el punzón, la matriz, la trancha y los topes.
- Busca contactos potenciales entre la pieza, las herramientas y la máquina. La ausencia de una colisión dibujada no demuestra que el movimiento real sea seguro.
- Comprueba especialmente alas cortas, perfiles en U/Z/caja, piezas grandes, pliegues consecutivos y cambios de orientación.

### F. Guardar y documentar

- Conserva los datos de material, espesor, herramienta, matriz, secuencia, tolerancias y fuente de cada cota.
- Usa las funciones de oficina técnica/exportación que estén disponibles en la versión publicada y revisa el contenido exportado.
- Guarda una copia de los datos de trabajo fuera del navegador si el flujo de producción requiere trazabilidad.

## 4. Comprobación antes de fabricar

- [ ] Material y espesor confirmados.
- [ ] Unidades y cotas revisadas.
- [ ] Plano exacto de punzón y matriz verificado.
- [ ] Capacidad, carrera, altura libre y límites de la máquina confirmados.
- [ ] Orden de plegado comprobado en todos los módulos.
- [ ] Colisiones y movimientos de topes revisados.
- [ ] Desarrollo contrastado con una pieza de prueba o un método validado.
- [ ] Programa CNC revisado por personal cualificado.
- [ ] Primera pieza comprobada antes de producción.

## 5. Diagnóstico básico

**Pantalla de inicio que no termina:** recarga la página; prueba ventana privada; confirma que el despliegue de GitHub Pages haya finalizado.

**Menú o panel con colores antiguos:** puede tratarse de caché local. Reabre la web en una ventana privada para comparar antes de borrar datos del navegador.

**No se puede marcar un pliegue 2D:** comprueba que estás pulsando la geometría del pliegue y no el margen del lienzo. Si el panel informativo tapa la pieza, captura pantalla y registra el ancho de pantalla.

**Herramienta o matriz no aparece:** comprueba fabricante, ángulo y abertura V. No se debe asumir que la biblioteca contiene todas las referencias comerciales.

**Orden distinto entre módulos:** no liberes el programa. Registra pieza, orden esperado, pasos de reproducción y capturas de cada módulo.

## 6. Incidencias que conviene registrar

Incluye siempre: navegador y dispositivo, ancho de pantalla, URL, fecha, módulo, pasos exactos, datos de pieza mínimos para reproducir, resultado esperado, resultado observado y captura. No adjuntes información confidencial de clientes o de fabricación que no sea necesaria.
