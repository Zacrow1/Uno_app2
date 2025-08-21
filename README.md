<<<<<<< HEAD
# UNO Digital - API del Juego

## Descripción

UNO Digital es una API REST para el juego de cartas UNO. El proyecto implementa una arquitectura de tres capas con programación funcional, utilizando Node.js, Express, Sequelize y Jest para testing.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL con Sequelize ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Testing**: Jest, Supertest
- **Programación Funcional**: Ramda, utilidades personalizadas
- **Documentación**: Postman Collection

## Estructura del Proyecto

```
proyectocapstone/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── services/        # Lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middleware personalizado
│   ├── utils/           # Utilidades funcionales
│   ├── orm/             # Configuración ORM
│   └── database/        # Configuración de base de datos
├── tests/
│   ├── controllers/     # Tests unitarios de controladores
│   ├── integration/     # Tests de integración
│   └── routes/          # Tests de rutas API
├── documents/           # Documentación y imágenes
├── postman_collection.json  # Colección de Postman
└── README.md           # Este archivo
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd proyectocapstone
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASS=tu_password
   DB_NAME=uno_digital
   DB_DIALECT=mysql
   JWT_SECRET=tu_secreto_jwt
   ```

4. **Configurar base de datos**
   ```bash
   # Crear base de datos
   CREATE DATABASE uno_digital;
   
   # Sincronizar modelos (opcional)
   npm run db:sync
   ```

5. **Ejecutar el servidor**
   ```bash
   npm start
   ```

## Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### Tipos de Tests

- **Tests Unitarios**: Para controladores y servicios
- **Tests de Integración**: Para base de datos y API
- **Tests de Rutas**: Para endpoints de la API

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/players/register` | Registrar nuevo usuario |
| POST | `/api/players/login` | Iniciar sesión |
| POST | `/api/players/logout` | Cerrar sesión |
| GET | `/api/players/profile` | Obtener perfil de usuario |

### Jugadores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/players` | Crear jugador |
| GET | `/api/players/:id` | Obtener jugador por ID |
| PUT | `/api/players/:id` | Actualizar jugador |
| DELETE | `/api/players/:id` | Eliminar jugador |
| GET | `/api/players` | Listar todos los jugadores |

### Juegos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/games` | Crear juego |
| GET | `/api/games/:id` | Obtener juego por ID |
| PUT | `/api/games/:id` | Actualizar juego |
| DELETE | `/api/games/:id` | Eliminar juego |
| GET | `/api/games` | Listar todos los juegos |
| POST | `/api/games/:id/join` | Unirse a un juego |
| POST | `/api/games/:id/start` | Iniciar juego |
| POST | `/api/games/:id/leave` | Salir de un juego |
| POST | `/api/games/:id/end` | Finalizar juego |
| GET | `/api/games/:id/state` | Estado del juego |
| GET | `/api/games/:id/players` | Jugadores en el juego |
| GET | `/api/games/:id/current-player` | Jugador actual |
| GET | `/api/games/:id/top-card` | Carta superior |
| GET | `/api/games/:id/scores` | Puntuaciones del juego |

### Tarjetas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cards` | Crear tarjeta |
| GET | `/api/cards/:id` | Obtener tarjeta por ID |
| PUT | `/api/cards/:id` | Actualizar tarjeta |
| DELETE | `/api/cards/:id` | Eliminar tarjeta |
| GET | `/api/cards` | Listar todas las tarjetas |
| POST | `/api/cards/initialize` | Inicializar mazo UNO |
| GET | `/api/cards/color/:color` | Tarjetas por color |
| GET | `/api/cards/type/:type` | Tarjetas por tipo |

### Scores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/scores` | Crear score |
| GET | `/api/scores/:id` | Obtener score por ID |
| PUT | `/api/scores/:id` | Actualizar score |
| DELETE | `/api/scores/:id` | Eliminar score |
| GET | `/api/scores` | Listar todos los scores |
| GET | `/api/scores/player/:id` | Scores por jugador |
| GET | `/api/scores/game/:id` | Scores por juego |
| GET | `/api/scores/top` | Mejores scores |
| GET | `/api/scores/player/:id/stats` | Estadísticas de jugador |
| GET | `/api/scores/game/:id/leaderboard` | Leaderboard del juego |

## Programación Funcional

El proyecto utiliza programación funcional con utilidades personalizadas:

### Utilidades Principales

- **Composición**: `compose`, `pipe`
- **Transformación**: `map`, `filter`, `reduce`
- **Validación**: `isNil`, `isEmpty`
- **Manejo de errores**: `tryCatch`
- **Currying**: `curry`
- **Utilidades de objetos**: `pick`, `omit`, `merge`

### Ejemplo de Uso

```javascript
import { pipe, map, filter, pick } from '../utils/functional.js';

// Transformar datos de jugadores
const transformPlayers = pipe(
    map(player => player.toJSON()),
    map(pick(['id', 'username', 'email'])),
    filter(player => player.active)
);
```

## Base de Datos

### Modelos

- **Player**: Jugadores del sistema
- **Game**: Juegos creados
- **Card**: Tarjetas del juego UNO
- **Score**: Puntuaciones históricas

### Relaciones

- Player ↔ Game (Many-to-Many)
- Player → Score (One-to-Many)
- Game → Score (One-to-Many)

## Testing

### Estructura de Tests

```
tests/
├── controllers/
│   ├── playersController.test.js
│   ├── authController.test.js
│   ├── gamesController.test.js
│   ├── cardsController.test.js
│   └── scoresController.test.js
├── integration/
│   └── database.test.js
└── routes/
    └── api.test.js
```

### Ejemplos de Tests

```javascript
// Test unitario con programación funcional
describe('Players Controller', () => {
  it('debería crear un jugador exitosamente', async () => {
    const req = createMockRequest(validPlayerData);
    const res = createMockResponse();
    
    await playersController.createPlayer(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });
});
```

## Colección Postman

El proyecto incluye una colección completa de Postman (`postman_collection.json`) con:

- Todas las rutas de la API
- Ejemplos de requests
- Variables de entorno
- Autenticación JWT

### Importar en Postman

1. Abrir Postman
2. Click en "Import"
3. Seleccionar archivo `postman_collection.json`
4. Configurar variables de entorno:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: Token JWT obtenido del login

## Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor
npm run dev           # Modo desarrollo con nodemon

# Testing
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con cobertura

# Base de datos
npm run db:sync       # Sincronizar modelos
npm run db:migrate    # Ejecutar migraciones
```

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Autor

Agustin De Luca


=======
# 🚀 Welcome to Z.ai Code Scaffold

A modern, production-ready web application scaffold powered by cutting-edge technologies, designed to accelerate your development with [Z.ai](https://chat.z.ai)'s AI-powered coding assistance.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Axios** - Promise-based HTTP client

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation Node.js and TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## 🤖 Powered by Z.ai

This scaffold is optimized for use with [Z.ai](https://chat.z.ai) - your AI assistant for:

- **💻 Code Generation** - Generate components, pages, and features instantly
- **🎨 UI Development** - Create beautiful interfaces with AI assistance  
- **🔧 Bug Fixing** - Identify and resolve issues with intelligent suggestions
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices

Ready to build something amazing? Start chatting with Z.ai at [chat.z.ai](https://chat.z.ai) and experience the future of AI-powered development!

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🤝 Get Started with Z.ai

1. **Clone this scaffold** to jumpstart your project
2. **Visit [chat.z.ai](https://chat.z.ai)** to access your AI coding assistant
3. **Start building** with intelligent code generation and assistance
4. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community. Supercharged by [Z.ai](https://chat.z.ai) 🚀
>>>>>>> origin/Week6
