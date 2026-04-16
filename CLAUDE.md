# Instrucciones del Proyecto: App de Presupuesto

## Contexto del Proyecto y UX/UI
Desarrollo de una aplicación web de gestión financiera personal. Busca optimizar como el usuario maneja y administra su presupuesto y recursos financieros.
- **Funcionalidad Core:** El usuario ingresa un presupuesto mensual y registra gastos a lo largo del mes (con categorías y descripción).
- **Experiencia de Usuario (UX/UI):** Interfaz simple, moderna, cálida e intuitiva. Las acciones de agregar, modificar o eliminar un gasto deben ser evidentes y sin fricción. 
- **Estructura:** Monorepo con backend/, frontend/ y docker-compose.yml

## Backend: Java 21 + Spring Boot
- **Arquitectura:** Aplica un patrón de diseño multicapa estricto (Controller -> Service -> Repository).
- **Características:** Utiliza `records` exclusivamente para DTOs, aprovecha el *pattern matching* y las *switch expressions* donde simplifiquen la lectura.
- **Responsabilidades:** Los controladores son "tontos" y solo manejan HTTP/Rutas. Toda la lógica de negocio reside aislada en los Servicios.
- **Base de Datos (SQL):** Escribe consultas optimizadas con Spring Data JPA, evitando el problema N+1.
- **Manejo de Errores:** Utiliza `@ControllerAdvice` para el manejo global de excepciones. Retorna siempre respuestas HTTP estandarizadas.

## Frontend: React + Vite + TypeScript
- **TypeScript Estricto:** Prohibido el uso de `any`. Define `interfaces` o `types` precisos para todos los props, estados y respuestas.
- **Componentes Limpios:** Crea componentes funcionales pequeños con una Única Responsabilidad. Extrae la lógica compleja a *Custom Hooks*.
- **Estructura:** Mantén una separación clara entre componentes UI (presentacionales) y componentes contenedores (lógicos).

## Flujo de Trabajo y Autonomía (Skills)
- **Uso de Skills/Herramientas:** Tienes permiso total para usar tus herramientas (búsqueda en el proyecto, lectura de archivos, ejecución de comandos en terminal) siempre que lo consideres necesario para obtener contexto antes de proponer o escribir código. No adivines el código existente, búscalo.
- **Linting Continuo:** El código debe estar siempre linteado. Antes de dar por finalizada una modificación o responder, asegúrate de que el código cumple con ESLint/Prettier en el frontend, y con las convenciones de estilo de Java en el backend. Si generas código con errores de linter, corrígelos inmediatamente.

## Reglas Generales
- **Idioma:** El código (variables, métodos, clases, tablas SQL) va 100% en inglés. Las explicaciones en el chat pueden ir en español.
- **Nomenclatura:** Usa nombres descriptivos y explícitos (ej. `calculateTotalBalance`, no `calcTotBal`).
- **Dependencias:** Prioriza resolver problemas con código nativo limpio antes de sugerir instalar librerías externas.