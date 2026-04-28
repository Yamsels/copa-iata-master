# ✈️ Copa IATA Master

**Copa IATA Master** es una aplicación web interactiva y educativa diseñada para ayudar a entusiastas de la aviación, estudiantes y profesionales a memorizar los 85 códigos IATA de los destinos operados por Copa Airlines.

![Copa IATA Master](public/hero.png)

## 🎮 Cómo Jugar

1.  **Selecciona una Región**: Comienza con Norteamérica y desbloquea nuevas regiones a medida que demuestres tu dominio.
2.  **Elige tu Modo**:
    *   **Modo Práctica**: Tómate tu tiempo para aprender cada código sin presión.
    *   **Modo Examen**: Pon a prueba tus reflejos con un cronómetro de 5 a 7 segundos por pregunta.
3.  **Responde**: Escribe el código IATA de 3 letras para la ciudad mostrada o selecciona la ciudad correcta si se te da el código (en modo desafío).
4.  **Gana Puntos y Desbloquea**: Obtén una precisión del **90% o más** para desbloquear la siguiente región en el mapa.
5.  **Cuida tus Vidas**: Tienes 3 vidas por sesión. Si las pierdes todas, el juego termina.

## 🚀 Funcionalidades Principales

### 🗺️ Progresión por Regiones
El juego está dividido en 8 regiones estratégicas que se desbloquean secuencialmente:
- Norteamérica
- Centroamérica
- Caribe
- Colombia
- Brasil
- Venezuela
- Argentina
- Suramérica General

### 👨‍✈️ Sistema de Rangos
Tu progreso global te otorga rangos basados en la cantidad de códigos "dominados":
- **Cadete**: 0% - 39%
- **Copiloto**: 40% - 69%
- **Primer Oficial**: 70% - 89%
- **Capitán**: 90% - 99%
- **Comandante de Flota**: 100%

### 🎲 Modos de Dificultad
- **Estándar**: Preguntas en orden alfabético de Ciudad a IATA.
- **Desafío (Challenge)**: Preguntas aleatorias y modo "Inverso" (donde debes identificar la ciudad a partir del código IATA).

### ⚡ Experiencia de Usuario Premium
- **Feedback Visual Dinámico**: Animaciones de vibración (shake) para errores y destellos de color para aciertos.
- **Efectos de Sonido**: Audio inmersivo para aciertos, errores y finalización de niveles.
- **Diseño Glassmorphism**: Una interfaz moderna, limpia y responsive que se adapta a dispositivos móviles y escritorio.
- **Confeti de Celebración**: Efectos de victoria al alcanzar puntajes perfectos.

## 🛠️ Tecnologías Utilizadas

- **Next.js 15+** (App Router)
- **React**
- **Tailwind CSS** (Diseño Premium)
- **Framer Motion** (Animaciones fluidas)
- **Lucide React** (Iconografía)
- **Canvas Confetti** (Efectos visuales)

## 📦 Instalación y Desarrollo

Si deseas ejecutar este proyecto localmente:

1. Clona el repositorio:
   ```bash
   git clone [url-del-repositorio]
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---
*Desarrollado con ❤️ para la comunidad aeronáutica.*
