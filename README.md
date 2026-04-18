● # PresWatch — Gestión de Presupuesto Personal

  Aplicación web para administrar tu presupuesto mensual y registrar gastos de forma simple e intuitiva. Definí cuánto planeás gastar cada mes, registrá tus gastos con categorías y descripción, y visualizá tus estadísticas con gráficos interactivos.

  ## Funcionalidades

  - **Presupuesto mensual** — Configurá un monto límite por mes y visualizá cuánto te queda disponible
  - **Registro de gastos** — Agregá, editá y eliminá gastos con monto, categoría, descripción y fecha
  - **Categorías** — 8 categorías predeterminadas (Comida, Transporte, Vivienda, Salud, etc.) + categorías personalizadas con color e ícono
  - **Dashboard de estadísticas** — Total gastado, promedio diario, top categoría, porcentaje de presupuesto usado
  - **Gráficos interactivos** — Desglose por categoría (pie chart) y por semana (bar chart)  - **Navegación por mes** — Consultá presupuestos y gastos de cualquier mes
  - **Autenticación JWT** — Registro e inicio de sesión con refresh automático de token    
  - **Tema claro/oscuro** — Paleta cálida stone/amber

  ## Stack Tecnológico

  ### Backend
  - **Java 21** + **Spring Boot 3.2**
  - **Spring Security** — Autenticación stateless con JWT
  - **Spring Data JPA** + **Hibernate 6** — Acceso a datos
  - **PostgreSQL 16** — Base de datos
  - **Flyway** — Migraciones de esquema versionadas
  - **Lombok** — Reducción de boilerplate

  ### Frontend
  - **React 18** + **TypeScript** (strict mode, sin `any`)
  - **Vite** — Build tool
  - **Tailwind CSS** — Estilos utility-first
  - **React Query (TanStack)** — Server state management
  - **Zustand** — Client state (auth, tema, mes seleccionado)
  - **React Hook Form** + **Zod** — Formularios con validación
  - **Recharts** — Gráficos (pie chart, bar chart)
  - **Axios** — HTTP client con interceptores JWT

  ### Infraestructura
  - **Docker Compose** — Orquestación de servicios (backend, frontend, PostgreSQL)
  - **GitHub Actions CI** — Build, lint, tests y security scanning en cada PR
  - **Testcontainers** — Tests de integración con PostgreSQL real
  - **Vitest** + **Testing Library** — Tests unitarios del frontend
  - **CodeQL** + **Gitleaks** — Análisis de seguridad estático y detección de secrets  
