# 🚀 Kanba - Modern Fullstack Kanban Board

![Status](https://img.shields.io/badge/Status-Deployed-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

<div align="center">
  <br />
  <a href="https://pablo-vi.github.io/Kanba/">
    <img src="https://img.shields.io/badge/🔴_VER_DEMO_EN_VIVO-VISITAR_AHORA-ff0000?style=for-the-badge&logo=github&logoColor=white" alt="Ver Demo en Vivo" height="50" />
  </a>
  <br />
  <br />
  <p><em>¡No necesitas instalar nada! Haz clic en el botón de arriba para probar la aplicación.</em></p>
  <br />
  
  ⚠️ **Nota para Usuarios Móviles:** Esta aplicación está diseñada para una experiencia óptima en escritorio. Se recomienda visualizarla en pantallas de al menos 1024px de ancho. Si accedes desde un dispositivo móvil, verás un mensaje de aviso.

![Logo Kanba](./src/assets/Logo.svg)
![Vista del Tablero](./screenshots/Main.png)  
</div>

---

## 📋 Descripción

**Kanba** es una aplicación de gestión de proyectos inspirada en Trello, diseñada para ser rápida, intuitiva y robusta. 

A diferencia de una simple "To-Do List", Kanba implementa un sistema complejo de **Drag and Drop**, sincronización de datos en **tiempo real** y autenticación segura. Está construida con las mejores prácticas de **React** y **TypeScript**, demostrando una arquitectura escalable y limpia.

## ✨ Características Destacadas

- **🔄 Sincronización Realtime (Supabase):** Si abres la app en dos pestañas (o dispositivos) diferentes, verás cómo las tarjetas se mueven solas al instante. Ideal para trabajo en equipo.
- **🤏 Drag & Drop Avanzado (@dnd-kit):**
  - Reordenamiento suave de tarjetas dentro de una columna.
  - Movimiento de tarjetas entre diferentes columnas.
  - Accesibilidad y animaciones fluidas.
- **🔐 Autenticación Completa:**
  - Login clásico (Email/Pass).
  - **OAuth** integrado con Google y GitHub.
- **🎨 UI/UX Pulida:**
  - Diseño *Desktop-first* (optimizado para grandes tableros).
  - Barras de desplazamiento personalizadas.
  - Feedback instantáneo con notificaciones (Toasts).

## 🛠️ Stack Tecnológico

| Área | Tecnologías |
|------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Estilos** | Tailwind CSS, CSS Modules (Custom Scrollbars) |
| **Estado Global** | Zustand (Gestión centralizada y limpia) |
| **Interacciones** | @dnd-kit (Core, Sortable, Utilities) |
| **Backend / DB** | Supabase (PostgreSQL, Auth, Realtime) |

---

<div align="center"> Desarrollado por <a href="https://www.linkedin.com/in/pabloalmellones" target="_blank">Pablo Almellones</a> </div>
