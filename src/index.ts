import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { listUsersRoute, getUserRoute, createUserRoute } from './routes/users'
import type { User } from './schemas/user'

const app = new OpenAPIHono()

// ルートエンドポイント
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// モックデータ
const mockUsers: User[] = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    age: 25,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    age: 30,
    createdAt: '2025-01-02T00:00:00Z',
  },
]

// GET /users - ユーザー一覧取得
app.openapi(listUsersRoute, (c) => {
  return c.json({
    users: mockUsers,
    total: mockUsers.length,
  })
})

// GET /users/:id - ユーザー詳細取得
app.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param')
  const user = mockUsers.find((u) => u.id === id)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user, 200)
})

// POST /users - ユーザー作成
app.openapi(createUserRoute, (c) => {
  const body = c.req.valid('json')
  const newUser: User = {
    id: String(mockUsers.length + 1),
    ...body,
    createdAt: new Date().toISOString(),
  }
  mockUsers.push(newUser)

  return c.json(newUser, 201)
})

// OpenAPI仕様書エンドポイント
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Hono Vitest v4 API',
    version: '1.0.0',
    description: 'Zod OpenAPIを使用したスキーマ駆動開発のサンプルAPI',
  },
})

// Swagger UIエンドポイント
app.get('/ui', swaggerUI({ url: '/doc' }))

export default app
