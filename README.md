# 🏋️‍♂️ FitPulse Pro — React Native & Expo Fitness Tracker (Android / iOS / Web)

Aplicación móvil profesional de **Fitness, Seguimiento de Fuerza (1RM) y Temporizador Inteligente**, desarrollada con **React Native, Expo y TypeScript**. Diseñada con arquitectura limpia para portafolio profesional y lista para producción en **Google Play Store** (`.aab`) o distribución directa en Android (`.apk`).

---

## ✨ Características Principales

1. **Dashboard de Rendimiento y Rachas (`Inicio`)**:
   - Seguimiento de racha activa, sesiones completadas, toneladas de volumen levantado y récords personales (PRs).
   - Gráfica de barras de volumen semanal levantado (Lun - Dom).
   - Biblioteca de rutinas especializadas (*Push*, *Pull*, *Legs*, *Full Body en Casa / Calistenia*).

2. **Entrenamiento en Vivo + Temporizador Reactivo (`Entrenar`)**:
   - Registro en tiempo real de series, peso (`kg`) y repeticiones.
   - **Detección automática de Récords Personales (🏆 PR)** usando la fórmula científica de Epley (`1RM`).
   - **Temporizador de descanso inteligente** que inicia automáticamente al completar cada serie, con controles `+15s`, `-15s`, presets (`60s`, `90s`, `120s`) y barra de progreso.

3. **Analítica de Fuerza y Evolución Corporal (`Progreso`)**:
   - **Calculadora científica de 1RM** interactiva con desglose de porcentajes de carga (`95%` a `70%`) para fuerza máxima e hipertrofia.
   - Registro histórico de peso corporal y bitácora completa de entrenamientos guardados en almacenamiento persistente (`AsyncStorage`).

4. **Generador de Rutinas con IA & Monetización Híbrida (`Coach IA`)**:
   - Generador dinámico de rutinas según objetivo, días por semana y enfoque muscular.
   - **Paywall Híbrido listo para producción**: combina suscripciones (*Anual con 7 días de prueba / Semanal*) + desbloqueo gratuito viendo un **Anuncio de Video Recompensado (Rewarded Video Ad)**, el modelo de mayor conversión en Android.

---

## 🚀 Cómo probarla GRATIS en tu celular Android o PC ($0 USD)

### Opción A: Vista previa inmediata en simulador Android (1 clic, sin instalar nada)
Abre el archivo [`preview-android.html`](./preview-android.html) en cualquier navegador para usar la app dentro de un teléfono Android interactivo al instante.

### Opción B: Correr el proyecto React Native en tu celular real con Expo Go ($0)
1. Abre una terminal en la carpeta del proyecto:
   ```bash
   cd C:\Users\Eder_\FitPulsePro
   npm install
   npx expo start
   ```
2. Descarga gratis la app **Expo Go** en tu celular Android y escanea el código QR que aparece en la terminal.

### Opción C: Generar el archivo `.APK` instalable para Android GRATIS ($0)
Este proyecto ya incluye [`eas.json`](./eas.json) configurado para exportar un `.apk` directo sin pagar cuenta de Google Play:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
Esto te entregará un link para descargar tu archivo `.apk`, instalarlo en cualquier Android o subirlo gratis a **Samsung Galaxy Store**, **Uptodown** o **Amazon Appstore**.
