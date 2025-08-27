# 🎮 UNO Digital Frontend

Frontend en JavaScript puro para la aplicación UNO Digital con integración completa de API, sistema de caché y gestión de juegos.

## 📋 Descripción

Este frontend es una aplicación web completa construida con JavaScript puro (sin frameworks) que proporciona una interfaz intuitiva y moderna para el juego de cartas UNO. Incluye gestión de jugadores, juegos, puntuaciones y monitoreo de caché.

## ✨ Características

### 🎯 **Funcionalidades Principales**
- **Sistema de Autenticación**: Login, registro y gestión de sesiones
- **Gestión de Jugadores**: CRUD completo de jugadores con búsqueda y filtrado
- **Gestión de Juegos**: Crear, unirse, iniciar y gestionar partidas UNO
- **Sistema de Puntuaciones**: Tabla de líderes con estadísticas detalladas
- **Monitoreo de Caché**: Visualización y gestión del sistema de caché LRU
- **Dashboard Interactivo**: Estadísticas en tiempo real

### 🎨 **Interfaz de Usuario**
- **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- **Modo Oscuro/Claro**: Soporte para temas del sistema
- **Accesibilidad**: Navegación por teclado, lectores de pantalla
- **Animaciones Suaves**: Transiciones y micro-interacciones
- **Notificaciones**: Sistema de notificaciones no intrusivo

### 🔧 **Características Técnicas**
- **JavaScript Puro**: Sin dependencias de frameworks
- **Módular**: Arquitectura modular y mantenible
- **API RESTful**: Integración completa con backend
- **Gestión de Estado**: Estado centralizado y sincronizado
- **Manejo de Errores**: Robusto sistema de manejo de errores
- **Offline Detection**: Detección de conexión a internet

## 🚀 Instalación y Uso

### **Requisitos Previos**
- Navegador moderno (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Servidor backend UNO API corriendo en `http://localhost:3000`
- Conexión a internet para la API

### **Instalación**

1. **Clonar el repositorio**:
```bash
git clone https://github.com/Zacrow1/Uno_app2.git
cd Uno_app2
git checkout Week8Front
```

2. **Estructura del proyecto**:
```
frontend/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── api.js              # Módulo de comunicación API
│   ├── auth.js             # Módulo de autenticación
│   ├── games.js            # Módulo de gestión de juegos
│   ├── players.js          # Módulo de gestión de jugadores
│   ├── scores.js           # Módulo de puntuaciones
│   ├── cache.js            # Módulo de gestión de caché
│   ├── ui.js               # Módulo de interfaz
│   └── main.js             # Archivo principal
└── images/                 # Recursos de imágenes
```

3. **Configurar el backend**:
   - Asegúrate de que la API UNO esté corriendo en `http://localhost:3000`
   - Verifica que los endpoints estén accesibles

4. **Abrir la aplicación**:
   - Abre el archivo `frontend/index.html` en tu navegador
   - O usa un servidor local (recomendado):
     ```bash
     # Usando Python
     python -m http.server 8000
     
     # Usando Node.js
     npx http-server
     ```

5. **Acceder a la aplicación**:
   - Abre `http://localhost:8000` en tu navegador
   - La aplicación estará lista para usar

## 📱 Guía de Uso

### **1. Registro y Autenticación**

#### **Crear una cuenta**:
1. Haz clic en "Registrarse" en el header
2. Completa el formulario con tu nombre, email y contraseña
3. Haz clic en "Registrar"
4. Inicia sesión con tus nuevas credenciales

#### **Iniciar sesión**:
1. Haz clic en "Iniciar Sesión" en el header
2. Ingresa tu email y contraseña
3. Haz clic en "Iniciar Sesión"

### **2. Dashboard Principal**

El dashboard muestra:
- **Estadísticas en tiempo real**: Jugadores totales, juegos activos, partidas jugadas
- **Tiempo de respuesta**: Latencia de la API
- **Accesos rápidos**: Botones para crear juegos y registrarse

### **3. Gestión de Juegos**

#### **Crear un juego**:
1. Ve a la sección "Juegos"
2. Haz clic en "Nuevo Juego"
3. Completa el formulario:
   - Nombre del juego
   - Número máximo de jugadores (2-8)
4. Haz clic en "Crear Juego"

#### **Unirse a un juego**:
1. Busca un juego con estado "Esperando"
2. Haz clic en "Ver Detalles"
3. Haz clic en "Unirse al Juego"

#### **Iniciar un juego**:
1. Solo el creador puede iniciar el juego
2. Se necesitan al menos 2 jugadores
3. Haz clic en "Iniciar Juego"

#### **Ver detalles del juego**:
- Información completa del juego
- Lista de jugadores
- Estado actual
- Acciones disponibles

### **4. Gestión de Jugadores**

#### **Ver todos los jugadores**:
1. Ve a la sección "Jugadores"
2. Explora la lista de todos los jugadores registrados
3. Usa el buscador para encontrar jugadores específicos

#### **Ver detalles del jugador**:
- Información del perfil
- Estadísticas de juego
- Historial de partidas

### **5. Sistema de Puntuaciones**

#### **Tabla de líderes**:
1. Ve a la sección "Puntuaciones"
2. Visualiza la tabla con todas las puntuaciones
3. Filtra por "Top 10" o "Más recientes"

#### **Detalles de puntuación**:
- Información completa de la puntuación
- Datos del jugador y juego
- Posición y fecha

### **6. Monitoreo de Caché**

#### **Ver estadísticas de caché**:
1. Ve a la sección "Caché"
2. Visualiza:
   - Tamaño actual y máximo
   - Número de entradas
   - Uso de memoria estimado

#### **Gestionar caché**:
- **Limpiar caché**: Eliminar todas las entradas
- **Eliminar entrada**: Eliminar entradas específicas
- **Refrescar**: Actualizar estadísticas

## 🎨 Personalización

### **Configuración de la API**

Cambia la URL base de la API en `js/api.js`:
```javascript
const API = {
    baseURL: 'http://localhost:3000/api', // Cambia esta URL
    // ... resto de la configuración
};
```

### **Temas y Colores**

Los colores se definen en `css/styles.css` en las variables CSS:
```css
:root {
    --primary-color: #e74c3c;    /* Color principal rojo UNO */
    --secondary-color: #3498db;  /* Color secundario azul */
    --success-color: #27ae60;    /* Color éxito verde */
    --warning-color: #f39c12;    /* Color advertencia naranja */
    --danger-color: #e74c3c;     /* Color peligro rojo */
}
```

### **Idioma**

La aplicación está en español, pero puedes traducirla modificando los textos en:
- Archivos HTML (`index.html`)
- Archivos JavaScript (mensajes de notificación)

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|--------|--------|
| `Ctrl/Cmd + K` | Buscar |
| `Ctrl/Cmd + N` | Nuevo juego |
| `Ctrl/Cmd + R` | Recargar |
| `Ctrl/Cmd + Shift + R` | Recargar forzada |
| `Esc` | Cerrar modales |
| `F1` | Mostrar ayuda |

## 🔧 Arquitectura del Código

### **Módulos JavaScript**

#### **API Module (`js/api.js`)**
- Comunicación con el backend
- Gestión de peticiones HTTP
- Manejo de autenticación
- Utilidades de API

#### **Auth Module (`js/auth.js`)**
- Gestión de autenticación
- Manejo de sesiones
- UI de login/registro
- Validación de usuarios

#### **Games Module (`js/games.js`)**
- Gestión de juegos UNO
- CRUD de juegos
- Lógica de unirse/iniciar juegos
- Renderizado de interfaces

#### **Players Module (`js/players.js`)**
- Gestión de jugadores
- Búsqueda y filtrado
- Detalles de jugadores
- Estadísticas

#### **Scores Module (`js/scores.js`)**
- Sistema de puntuaciones
- Tabla de líderes
- Detalles de puntuaciones
- Reportes

#### **Cache Module (`js/cache.js`)**
- Monitoreo de caché
- Gestión de entradas
- Estadísticas y reportes
- Optimización

#### **UI Module (`js/ui.js`)**
- Gestión de interfaz
- Navegación entre secciones
- Manejo de modales
- Notificaciones

#### **Main Module (`js/main.js`)**
- Coordinación de módulos
- Inicialización de la aplicación
- Manejo de errores global
- Configuración

### **Flujo de Datos**

```
Usuario → UI → Módulos → API → Backend
    ↓
Interfaz ← Estado ← Respuestas ← Datos
```

## 🧪 Pruebas

### **Pruebas Manuales**

1. **Pruebas de autenticación**:
   - Registrar nuevo usuario
   - Iniciar sesión
   - Cerrar sesión
   - Verificar persistencia de sesión

2. **Pruebas de juegos**:
   - Crear juego
   - Unirse a juego
   - Iniciar juego
   - Verificar estados

3. **Pruebas de caché**:
   - Verificar estadísticas
   - Limpiar caché
   - Eliminar entradas
   - Monitorear rendimiento

4. **Pruebas de responsive**:
   - Probar en diferentes tamaños de pantalla
   - Verificar navegación móvil
   - Probar tablet y desktop

### **Pruebas Automatizadas**

El proyecto está preparado para pruebas automatizadas. Puedes usar:

```bash
# Instalar dependencias de testing
npm install --save-dev jest puppeteer

# Ejecutar pruebas
npm test
```

## 🐛 Solución de Problemas

### **Problemas Comunes**

#### **1. Error de conexión a la API**
```
Error: Failed to fetch
```
**Solución**:
- Verifica que el backend esté corriendo
- Comprueba la URL en `js/api.js`
- Verifica el CORS en el backend

#### **2. Problemas de autenticación**
```
Error: Unauthorized
```
**Solución**:
- Verifica tus credenciales
- Limpia el localStorage
- Vuelve a iniciar sesión

#### **3. La interfaz no se actualiza**
```
Los datos no se refrescan
```
**Solución**:
- Verifica la consola de errores
- Recarga la página (Ctrl+R)
- Limpia la caché del navegador

#### **4. Problemas de caché**
```
Las entradas no se muestran
```
**Solución**:
- Limpiar la caché desde la interfaz
- Recargar la página
- Verificar la configuración de caché

### **Herramientas de Desarrollo**

#### **Console Logging**
La aplicación incluye logging detallado:
```javascript
// Habilitar logging detallado
localStorage.setItem('debug', 'uno:*');
```

#### **Network Tab**
Usa las herramientas de desarrollador para:
- Inspeccionar peticiones de red
- Verificar respuestas de la API
- Analizar rendimiento

#### **Application Tab**
Inspecciona:
- LocalStorage y SessionStorage
- Caché de la aplicación
- Cookies y almacenamiento

## 🚀 Despliegue

### **Despliegue Estático**

La aplicación puede ser desplegada en cualquier servidor estático:

1. **GitHub Pages**:
   - Sube los archivos a la rama `gh-pages`
   - Habilita GitHub Pages en el repositorio

2. **Netlify**:
   - Conecta tu repositorio
   - Configura el directorio `frontend` como raíz

3. **Vercel**:
   - Importa tu proyecto
   - Configura el directorio `frontend`

### **Configuración de Producción**

Para producción, modifica la URL de la API:
```javascript
// js/api.js
const API = {
    baseURL: 'https://tu-api-production.com/api',
    // ...
};
```

## 📝 Contribuir

### **Guía de Contribución**

1. **Fork el repositorio**
2. **Crear una rama**:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Hacer cambios**
4. **Probar los cambios**
5. **Crear Pull Request**

### **Estándares de Código**

- Usar JavaScript ES6+
- Seguir la estructura modular existente
- Incluir comentarios para funciones complejas
- Mantener consistencia en el estilo

### **Reporte de Issues**

Usa el sistema de issues de GitHub para reportar:
- Bugs
- Sugerencias
- Mejoras
- Preguntas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Créditos

### **Desarrollo**
- **Frontend**: JavaScript puro, HTML5, CSS3
- **Diseño**: CSS Grid, Flexbox, Responsive Design
- **Arquitectura**: Módular, sin frameworks

### **Agradecimientos**
- Iconos: Font Awesome
- Paleta de colores: Inspirada en el juego UNO
- Diseño responsivo: Mobile-first approach

## 📞 Soporte

Para soporte y preguntas:
1. **Issues de GitHub**: Crea un issue en el repositorio
2. **Documentación**: Revisa este README y los comentarios en el código
3. **Comunidad**: Únete a las discusiones del repositorio

---

## 🎯 Roadmap Futuro

### **Próximas Características**

- [ ] **WebSocket Integration**: Tiempo real para juegos
- [ ] **PWA Support**: Aplicación web progresiva
- [ ] **Offline Mode**: Funcionalidad sin conexión
- [ ] **Dark Mode Toggle**: Selector de tema manual
- [ ] **Game Interface**: Interfaz completa para jugar UNO
- [ ] **Chat System**: Chat entre jugadores
- [ ] **Tournaments**: Sistema de torneos
- [ ] **Achievements**: Sistema de logros
- [ ] **Profiles**: Perfiles de jugador mejorados
- [ ] **Statistics**: Estadísticas avanzadas

### **Mejoras Técnicas**

- [ ] **TypeScript**: Migración a TypeScript
- [ ] **Testing**: Pruebas unitarias y de integración
- [ ] **Bundle Optimization**: Optimización de carga
- [ ] **Performance**: Mejoras de rendimiento
- [ ] **Accessibility**: Mejoras de accesibilidad
- [ ] **SEO**: Optimización para motores de búsqueda

---

🎮 **¡Gracias por usar UNO Digital Frontend!** 🃏