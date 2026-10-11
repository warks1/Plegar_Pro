# Plegar Pro

**Versión de trabajo: v59.0 — mejora de gemelo digital, auditoría de fuentes y trazabilidad de oficina técnica.**

Plegar Pro es una aplicación web estática para planificar piezas de chapa, comparar matrices V, preparar secuencias de plegado y revisar geometría antes de fabricar.

## Abrir la aplicación

- [Aplicación web en GitHub Pages](https://warks1.github.io/Plegar_Pro/)
- [Repositorio y código fuente](https://github.com/warks1/Plegar_Pro)
- [Registro de cambios v59.0](CHANGELOG_v59_0.txt)
- [Lista de comprobaciones v59.0](PRUEBAS_v59_0.txt)

No se necesita un proceso de compilación npm para servir la versión estática. La publicación de GitHub Pages depende de que termine correctamente la acción de despliegue.

## Funciones destacadas v55.0

- Fondo blanco predeterminado y preferencias visuales CAD/CAM.
- Numeración directa de pliegues al tocar la pieza; un segundo toque quita el número.
- Calculadora BA/BD, comparativa de matrices V y calibración de factor K con una pieza real medida.
- Programación 2D y 3D con selección de punzón, matriz y abertura V.
- Vista paramétrica de perfiles de herramientas y animación esquemática de una plegadora.
- Bibliotecas de materiales y herramientas conservadas entre versiones.

## Fuentes técnicas

- [AMADA AFH — catálogo oficial](https://cdn.amada.eu/fileadmin/Repository/Products/Brochures/Catalog_AFH_EN_2024.pdf)
- [MECOS Ibérica — catálogo general de utillaje](https://mecos.es/files/productos/utillaje-plegadora/MECOS-Catalogo-General-de-Utillaje-2022.pdf)
- [TRUMPF — herramientas de plegado](https://www.trumpf.com/en_INT/products/services/services-machines-systems-and-lasers/tools/bending-tools/)
- [EUROSTAMP — catálogo de herramientas](https://www.eurostamp-abkantwerkzeuge.de/online-shop/)
- [Bystronic Xpert Pro — ficha técnica](https://www.bystronic.com/sites/default/files/2026-03/tp007-BE-Techdaten-Xpert%20Pro_en_GB_0.pdf)

## Precisión y seguridad

Los cálculos de desarrollo utilizan BA/BD y los radios/K introducidos o estimados. La calibración de K requiere un desarrollo medido y cotas consistentes. Los radios naturales, fuerzas y alas mínimas que no provienen de una ficha exacta son estimaciones.

Las vistas CAD/CAM de esta versión son esquemáticas y no son modelos CAD oficiales certificados. Las dimensiones de utillaje no verificadas y la entrada Trumpf V85 con medidas pendientes no deben usarse para liberar programas CNC ni validar colisiones. Contrasta siempre el plano exacto de punzón/matriz, la capacidad de la máquina y la primera pieza.

## Actualización de ingeniería v59.0 (rama de trabajo)

- Añade una vista de gemelo digital 3D con bastidor, trancha móvil, portautillaje, punzón, matriz V y chapa; incluye órbita, zoom, cámaras y navegación por pasos.
- Añade auditoría por fuente con fecha, respuesta/error, enlaces y marca explícita de contenido no importado.
- Añade detección de posibles duplicados en el índice local de herramientas.
- Amplía la oficina técnica con historial de revisiones, lote/material, proceso, documento asociado y exportación del paquete técnico.
- El módulo se conserva separado (`pp59-engineering-upgrade.js`) y se añade a la caché del service worker. Los módulos previos no se eliminan.

**Limitaciones importantes:** el gemelo digital es una representación visual, no un modelo CAD oficial de una máquina concreta. La comprobación HTTP no descarga ni valida automáticamente los catálogos. Las dimensiones no verificadas siguen sin ser aptas para liberar programas CNC ni certificar colisiones.
