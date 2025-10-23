# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hono-based web application using Bun as the runtime. Hono is a lightweight web framework for building fast web applications.

## Development Commands

- **Install dependencies**: `bun install`
- **Start development server**: `bun run dev`
  - Runs with hot reload enabled
  - Server runs on http://localhost:3000

### Hono CLI Commands

This project uses Hono CLI (`@hono/cli`) for development and optimization:

- **Access Hono documentation**: `hono docs` - Outputs Hono docs in Markdown format
- **Search Hono docs**: `hono search <keyword>` - Search documentation and return JSON
- **Test requests without server**: `hono request -X GET -P /` - Send requests to the app without starting a server
- **Run with middleware**: `hono serve --use @hono/node-server/serve-static` - Dynamically add middleware without code changes
- **Optimize app**: `hono optimize` - Uses PreparedRegExpRouter for 16.5x faster initialization and 38% smaller bundle size

### Vitest Commands

This project uses Vitest 4 for testing:

- **Run tests**: `vitest` - Run tests in watch mode
- **Run tests once**: `vitest run` - Run all tests once and exit
- **Run with coverage**: `vitest --coverage` - Run tests with coverage report
- **Run with UI**: `vitest --ui` - Open Vitest UI for interactive testing

## Architecture

- **Runtime**: Bun (not Node.js)
- **Framework**: Hono v4 with OpenAPI support (`@hono/zod-openapi`)
- **Schema Validation**: Zod for type-safe schema definitions
- **Testing Framework**: Vitest 4
- **TypeScript Configuration**: Strict mode enabled with JSX support for Hono's JSX runtime
- **Entry Point**: `src/index.ts` - Exports the OpenAPIHono app instance as default export

### Directory Structure

```
src/
├── index.ts           # Main application with OpenAPIHono
├── schemas/           # Zod schema definitions
│   └── user.ts       # User-related schemas
├── routes/            # OpenAPI route definitions
│   └── users.ts      # User API routes
└── __tests__/         # Test files
    ├── index.test.ts  # Basic API tests
    └── users.test.ts  # Schema-driven API tests
```

## Key Notes

- The project uses Bun's native TypeScript support, no build step required
- JSX is configured to use Hono's JSX runtime (`jsxImportSource: "hono/jsx"`)
- The main app is exported as a default export from `src/index.ts`, which is the standard pattern for Hono applications running on Bun

## Schema-Driven Development with Zod OpenAPI

This project follows a schema-driven development approach using `@hono/zod-openapi`:

### 1. Define Schemas (`src/schemas/`)

```typescript
import { z } from '@hono/zod-openapi'

export const UserSchema = z.object({
  id: z.string().openapi({ example: '123' }),
  name: z.string().min(1).max(100).openapi({ example: '山田太郎' }),
  email: z.string().email().openapi({ example: 'yamada@example.com' }),
})
```

### 2. Create Routes (`src/routes/`)

```typescript
import { createRoute } from '@hono/zod-openapi'

export const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  request: { params: UserSchema.pick({ id: true }) },
  responses: {
    200: { content: { 'application/json': { schema: UserSchema } } }
  }
})
```

### 3. Implement Handlers (`src/index.ts`)

```typescript
import { OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()
app.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param')
  return c.json({ id, name: '...' })
})

// Auto-generate OpenAPI spec at /doc
app.doc('/doc', { openapi: '3.0.0', info: { ... } })
// Swagger UI at /ui
app.get('/ui', swaggerUI({ url: '/doc' }))
```

### 4. Test with Schema Matching

```typescript
test('returns correct schema', async () => {
  const res = await app.request('/users/1')
  const data = await res.json()

  // Validate response against Zod schema
  expect(data).toEqual(expect.schemaMatching(UserSchema))
})
```

### Benefits

- **Single Source of Truth**: Schemas define types, validation, and API documentation
- **Type Safety**: Full TypeScript inference from schemas
- **Auto-Generated Docs**: OpenAPI spec and Swagger UI generated automatically
- **Test Validation**: Use `expect.schemaMatching()` to verify responses match schemas
- **API Endpoints**:
  - `/doc` - OpenAPI specification (JSON)
  - `/ui` - Interactive Swagger UI

## Vitest 4 Key Features

- **Browser Mode**: Stable (no longer experimental) - Run tests in real browsers
  - Providers: `@vitest/browser-playwright`, `@vitest/browser-webdriverio`, `@vitest/browser-preview`
  - Import context from `vitest/browser` (not `@vitest/browser/context`)
- **Visual Regression Testing**: `expect().toMatchScreenshot()` and `toBeInViewport()` matchers
- **Playwright Traces**: Enable with `--browser.trace=on` for debugging
- **Type-Aware Hooks**: `test.beforeEach()` and `test.afterEach()` support extended context
- **New Matchers**:
  - `expect.assert()` - Chai's assert exposed on expect object
  - `expect.schemaMatching()` - Validate against Standard Schema v1 (Zod, Valibot, ArkType)
- **Reporter Updates**:
  - `basic` reporter removed (use `default` with `summary: false`)
  - New `tree` reporter for always showing tests in tree format
  - `verbose` reporter now always prints tests one by one
