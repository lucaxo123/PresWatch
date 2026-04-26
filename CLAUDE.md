# PresWatch — App de Gestión Financiera Personal

Monorepo: `backend/` (Java 21 + Spring Boot), `frontend/` (React + Vite + TS), `docker-compose.yml`

## Backend: Java 21 + Spring Boot
- Arquitectura: Controller → Service → Repository. DTOs como `records`. Lógica en servicios, controladores solo HTTP.
- Errores: `@ControllerAdvice` global, respuestas HTTP estandarizadas.
- **Seguridad:** Todas las queries a entidades con relación a usuario deben filtrar por `userId`. Para categorías (que incluyen defaults globales con `user_id = NULL`), usar `findByIdVisibleToUser(id, userId)` en vez de `findById()`.
- **Queries con relaciones:** Usar `LEFT JOIN FETCH` en queries `@Query` para entidades con relaciones LAZY (category, user) — evita N+1.
- **Migraciones:** Flyway en `backend/src/main/resources/db/migration/`. Nombrar como `V{N}__{descripcion}.sql`.

## Frontend: React + Vite + TypeScript
- Sin `any`. Componentes funcionales pequeños, lógica compleja en Custom Hooks.
- **Estado:** Zustand para estado de cliente (auth, theme, month), React Query (`@tanstack/react-query`) para estado de servidor. Mutations invalidan query keys relacionadas.
- **Formularios:** `react-hook-form` + `zod` para validación. Iconos de `lucide-react`.
- **Fechas locales:** Usar `new Date().toLocaleDateString('en-CA')` para YYYY-MM-DD (respeta timezone), no `toISOString().split('T')[0]`.

## Flujo de Trabajo
- Siempre buscar el código existente antes de escribir. Nunca adivinar.
- Lintear antes de dar por finalizado: ESLint/Prettier en frontend, convenciones Java en backend.
- **Git:** Rama `develop` para integración, `feature/*` para cada tarea. PRs van hacia `develop`. `gh` CLI está instalado.

## Reglas
- Código en inglés, chat en español. Sin abreviaciones en nombres.

## Verificación
- Frontend: `npx tsc --noEmit && npx eslint "src/**/*.ts" "src/**/*.tsx" && npm test` (desde `frontend/`)
- Backend: `mvn -B verify` (requiere Docker para Testcontainers, desde `backend/`)
- Rebuild: `docker compose down && docker compose up --build`
- Dev: `docker compose up` + `npm run dev` desde `frontend/`
