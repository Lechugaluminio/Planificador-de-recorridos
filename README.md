[README.md](https://github.com/user-attachments/files/34469540/README.md)
# Planificador de recorridos para Fire Studio

Herramienta web para **armar, probar y presentar recorridos interactivos de entrenamiento contra incendios** antes de pasarlos a [Fire Studio 7](https://www.digitalcombustion.com/) (Digital Combustion).

En Fire Studio, las flechas de navegación saltan a "la diapositiva número X": si se mueve o se borra una diapositiva, todos los enlaces se desordenan. Aquí las flechas apuntan a **fotos**, no a números. Cada foto recibe un número de diapositiva **permanente**, y al final la herramienta entrega las fotos numeradas y la hoja exacta de enlaces para Fire Studio.

Es un solo archivo HTML: no necesita instalación, servidor ni internet, y **las fotos nunca salen del computador**.

![Editor en modo realista](docs/editar.jpg)

---

## Qué hace

**Editar**
- Cargar las fotos del edificio (o arrastrarlas a la ventana).
- **Flechas de navegación**: clic en la foto → elegir el tipo de flecha → elegir la foto de destino. Crea automáticamente la flecha de regreso.
- **⛓ Encadenar**: crea flechas de avance y retorno entre fotos consecutivas de una vez.
- **Efectos**: marcadores de fuego, humo, explosión, hollín y materiales peligrosos (rojo = fuego, negro = humo), para reemplazarlos después por capas de Fire Studio.
- Tamaño de flechas y efectos con la **rueda del mouse** justo después de ponerlos o tocarlos.
- Arrastrar un efecto a otra foto de la lista lo **copia** ahí.
- Vista **Íconos / 🔥 Realista**: fuego y humo animados sobre la foto.
- Numeración fija: quitar una foto la deja **vacante** (no se corre ningún número).

**Mapa**

![Mapa del recorrido](docs/mapa.jpg)

- Vista de todo el recorrido como plano de conexiones, con zoom (hasta 1000 %) y paneo.
- Seleccionar fotos (clic, Shift+clic, Shift+arrastrar, Ctrl+A), encadenarlas, quitarlas.
- Conectar dos fotos arrastrando el **●+** de una a otra (ida y vuelta o solo ida).
- Clic en una conexión para cambiar su dirección o eliminarla.
- Avisos: fotos a las que no se llega, fotos sin salida, flechas rotas.

**Probar y presentar**

![Modo prueba](docs/probar.jpg)

- Recorrer el escenario como lo verá el alumno, con efectos animados.
- **Descargar presentación**: un `.html` único tipo "Player", solo navegable con las flechas, sin edición. Funciona en computador y en celular (en iPhone, abrirlo desde un link; ver más abajo).

**Exportar para Fire Studio** (menú ☰)
- `.zip` con las fotos renombradas en orden (`001_Nombre.jpg`), con luz y contraste igualados entre fotos (opcional).
- `hoja_enlaces.html`: cada diapositiva con sus flechas (ícono de la librería *Nav Icons*, posición, tamaño, destino) y sus efectos (librería sugerida, posición, tamaño, nota).
- `enlaces.csv` y `efectos.csv`.
- `proyecto_recorrido.json` para seguir editando.
- **Cambios pendientes**: después de "Marcar como aplicado", la herramienta lista solo lo que hay que corregir en Fire Studio.

**Proyectos**
- **Recientes**: los recorridos quedan guardados en el navegador y se reabren desde el menú.
- **Guardar proyecto** (`Ctrl+S`) descarga un `.json` con fecha y hora en el nombre.
- **Abrir proyecto** acepta el `.json` o el `.zip` exportado (recupera también las fotos).

---

## Cómo usarlo

1. Abre `index.html` con doble clic (Chrome o Edge), o la versión publicada en GitHub Pages.
2. **Menú ☰ → Importar fotos…** y elige las fotos del edificio.
3. Pon nombre a cada foto y conéctalas (Editar o Mapa). Marca la foto de **inicio** y la del **foco**.
4. Agrega marcadores de efectos.
5. Revisa en **Probar**.
6. **Menú ☰ → Exportar para Fire Studio…** → *Descargar .zip*.

### En Fire Studio (regla de oro)

- Crea las diapositivas **en el orden 001, 002, 003…** y carga como fondo la foto con ese número.
- **Nunca muevas ni borres diapositivas**. Las fotos nuevas van al final; las vacantes se dejan en blanco.
- Cada flecha es una capa de la librería **Nav Icons** con evento de enlace a la diapositiva indicada en la hoja.

### Atajos de teclado

| Dónde | Tecla | Acción |
|---|---|---|
| Todo | `Ctrl+S` | Guardar proyecto |
| Todo | `Ctrl+Z` / `Ctrl+Y` | Deshacer / rehacer |
| Confirmaciones | `Enter` / `Esc` | Aceptar / cancelar |
| Editar | `↑` `↓` | Foto anterior / siguiente |
| Editar | `E` | Cambiar entre Flechas y Efectos |
| Editar | `Supr` | Borrar flecha o efecto seleccionado |
| Editar | rueda (tras poner/tocar un ícono) | Tamaño del ícono |
| Mapa | rueda | Zoom hacia el cursor |
| Mapa | arrastrar el fondo | Mover la vista |
| Mapa | `Shift` + arrastrar | Seleccionar varias fotos |
| Mapa | `Ctrl+A` | Seleccionar todas |
| Mapa | `Supr` | Quitar fotos / borrar conexión seleccionada |
| Mapa | `+` `-` `0` | Acercar / alejar / ver todo |
| Probar / presentación | `Backspace` | Volver |

### Presentación en celulares

- **Android**: abrir el `.html` con Chrome.
- **iPhone**: abrirlo desde un archivo suele mostrar solo una vista previa sin interactividad. Lo confiable es **subirlo a una página web** (por ejemplo a este mismo repositorio con GitHub Pages) y compartir el link.

---

## Estructura del repositorio

```
index.html          ← la app completa (lo que se abre / se publica). Se genera con tools/build.py
src/
  app.html          ← interfaz y lógica (HTML + CSS + JS)
  fxengine.js       ← motor de fuego y humo animado (también va dentro de las presentaciones)
  demo.json         ← fotos reducidas del ejemplo "Monte Carmelo"
tools/
  build.py          ← une src/ en index.html
docs/               ← capturas para este README
```

### Modificar la app

1. Edita los archivos de `src/`.
2. Reconstruye `index.html`:
   ```bash
   python tools/build.py
   ```
   (Python 3, sin dependencias.)
3. Abre `index.html` en el navegador para probar.
4. Haz commit de `src/` **y** de `index.html`.

### Publicar con GitHub Pages

En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**, rama `main`, carpeta `/ (root)`. La app queda en `https://<usuario>.github.io/<repositorio>/`.

Para compartir una presentación descargada, súbela al repositorio (por ejemplo a una carpeta `presentaciones/`) y comparte su link de Pages. Ojo: el `.gitignore` excluye por defecto los archivos `presentacion_*.html`; para subir una a propósito, quita esa línea o agrégala con `git add -f`.

---

## Datos y privacidad

- Las fotos se procesan solo en el navegador; nada se sube a ningún servidor.
- "Recientes" se guarda en el navegador (IndexedDB). Si se borran los datos de navegación, se pierde: la copia segura es **Guardar proyecto** o el `.zip`.
- Para seguir exportando un proyecto reabierto otro día, hay que volver a cargar sus fotos (se reconectan solas por nombre de archivo).
- `src/demo.json` contiene fotos reducidas del edificio de ejemplo. Si el repositorio es público, esas fotos también lo serán.

## Aviso

Proyecto independiente, sin relación con Digital Combustion, Inc. "Fire Studio" es marca de su dueño. Esta herramienta **no lee ni escribe** los formatos internos de Fire Studio (`.dcs`, `.lbr`): trabaja con fotos comunes y entrega instrucciones para armar el escenario dentro del programa, usándolo según su documentación.
