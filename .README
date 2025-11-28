# 🎵 YouTube Music Desktop (Electron + Oh My Posh API)

Una aplicación de escritorio ligera y personalizada para YouTube Music, construida con Electron. Incluye atajos de teclado globales y un servidor API local para exponer la información de la canción que se está reproduciendo, lo que permite la integración con herramientas de terminal como Oh My Posh.

---

## ✨ Características Principales

* **Atajos de Teclado Globales:** Controla la reproducción (Play/Pause, Next, Previous) desde cualquier lugar de tu sistema.
* **API de Estado Local:** Un servidor Express se ejecuta en el puerto `9863` para proporcionar el estado actual de la canción (Título, Artista, Pausa).
* **Diseño Limpio:** Una barra de título minimalista y personalizada para una experiencia de escritorio.
* **Aislamiento:** La navegación se limita a `music.youtube.com`, abriendo enlaces externos en el navegador por defecto.

---

## 🛠️ Instalación y Requisitos

Esta aplicación requiere **Node.js** y **npm** (o yarn/pnpm) instalados en tu sistema.

### Requisitos

* Node.js (versión LTS recomendada)
* Electron (instalado vía `npm`)

### Pasos de Instalación

1.  **Clonar el repositorio (o crear la estructura de archivos):**

    ```bash
    git clone [URL_DE_TU_REPOSITORIO] mi-youtube-music
    cd mi-youtube-music
    ```

2.  **Instalar dependencias:**

    Necesitas `electron` y `express`.

    ```bash
    npm install
    # O, si quieres añadir express manualmente:
    # npm install express
    ```

---

## ▶️ Uso

### Ejecutar la Aplicación

Para iniciar la aplicación, usa el script `start` definido en tu `package.json`:

```bash
npm start
````

### Servidor API Local

La aplicación inicia un servidor Express en segundo plano que publica el estado de la canción en el siguiente endpoint:

  * **URL:** `http://127.0.0.1:9863/query`
  * **Propósito:** Este endpoint es consultado por Oh My Posh.

-----

## ⚙️ Configuración de Oh My Posh (Now Playing)

Para que tu terminal muestre la canción actual, debes configurar un segmento `http` en tu tema de Oh My Posh.

**⚠️ Nota:** El siguiente código usa la variable `.Body` que fue confirmada en el proceso de depuración para tu entorno.

### Bloque de Configuración (Segmento HTTP)

Abre tu archivo de tema de Oh My Posh (`.omp.json` o `.omp.yaml`) y añade o modifica el segmento `http` con este bloque. Este código manejará el cambio de color (verde/naranja) y el icono según el estado (Play/Pause).

```json
{
  "type": "http",
  "style": "powerline",
  "powerline_symbol": "\uE0B0",
  "foreground": "#111111",
  "background": "#1DB954", 
  "background_templates": [
    // Cambia a Naranja (#FF9800) si la canción está pausada
    "{{ if .Body.isPaused }}#FF9800{{ end }}"
  ],
  "properties": {
    "url": "[http://127.0.0.1:9863/query](http://127.0.0.1:9863/query)",
    "request_timeout": 2000
  },
  // La lógica que usa .Body para obtener el estado y el título
  "template": "{{ if .Body.display }}{{ if .Body.isPaused }} \uF04C PAUSA: {{ .Body.display }} {{ else }} \uF001 {{ .Body.display }} {{ end }}{{ end }}"
}
```

  * **Iconos:** $\uF001$ (Música) | $\uF04C$ (Pausa)
  * **Colores:** Verde (`#1DB954`) para Reproduciendo | Naranja (`#FF9800`) para Pausado

-----

## 🚀 Atajos de Teclado Globales

Los siguientes atajos funcionarán incluso si la ventana de la aplicación está minimizada o en segundo plano:

| Tecla | Función |
| :--- | :--- |
| **MediaPlayPause** | Alternar Reproducir/Pausar |
| **MediaNextTrack** | Canción Siguiente |
| **MediaPreviousTrack** | Canción Anterior |
| **Ctrl+Shift+Q** | Cerrar la aplicación (Electron) |

-----

## 📝 Licencia

Este proyecto está bajo la licencia **MIT**.

-----

## 🧑‍💻 Autor

  * **Nombre:** Ccori
  * **Contacto:** lvpccori@gmail.com
