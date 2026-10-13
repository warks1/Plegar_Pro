PLEGAR PRO · ESTADO DE MANTENIMIENTO
Repositorio: https://github.com/warks1/Plegar_Pro
Rama de trabajo: main
Entrada web: /index.html (raíz del repositorio)
Interfaz declarada por el módulo de colisiones: v64.8 · INDUSTRIAL EDITION

MÓDULOS PRINCIPALES
- pp54-engineering.js
- pp55-cad-precision.js
- pp56-collision-review.js
- pp57-system-integration.js
- pp59-engineering-upgrade.js
- pp60-graphics-runtime.js
- pp61-runtime-integrity.js
- pp62-contrast-playback-fix.js

COMPROBACIONES REALIZADAS EN EL CÓDIGO
- Todas las referencias JS locales de index.html existen en la rama main.
- Sintaxis JavaScript de los ocho módulos externos y del service worker comprobada.
- index.html carga PP62 y sw.js lo incluye en la lista de recursos.
- PP61 normaliza el orden de pliegues y limita los pasos/índices a rangos válidos.
- PP62 aclara tarjetas y subpaneles anidados para reducir texto oscuro sobre fondos azul marino.

LÍMITES IMPORTANTES
Estas comprobaciones son estáticas: no equivalen a ejecutar la aplicación en un navegador real.
Todavía hay que probar en navegador el arranque, la reproducción continua, la sincronización entre 2D/3D/colisiones y la detección geométrica con alas ya plegadas.
La detección actual es paramétrica/geométrica 2D orientativa, no un motor CAD de sólidos 3D validado ni una certificación de seguridad CNC. No usar como validación de seguridad de máquina.

PUBLICACIÓN EN GITHUB PAGES
1. En Settings → Pages, comprobar que la fuente publica la rama main y la raíz (/).
2. Confirmar que index.html permanece en la raíz y no dentro de una carpeta anidada.
3. Esperar a que finalice la publicación y abrir la URL de Pages en una pestaña nueva.
4. Si se ve una versión antigua, hacer una recarga forzada y comprobar el último commit de main antes de cambiar archivos o borrar módulos.
5. No eliminar módulos existentes para resolver problemas de caché.

IMPORTACIÓN DE PLANOS
No dar por válida una pieza si faltan cotas fiables. Confirmar longitud, ancho, altura, espesor, radios, retornos, unidades y orientación antes de fabricar.
