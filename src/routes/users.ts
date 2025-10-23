import { createRoute } from '@hono/zod-openapi'
import {
  UserSchema,
  CreateUserRequestSchema,
  UsersListResponseSchema,
  ErrorResponseSchema,
} from '../schemas/user'

// GET /users - ユーザー一覧取得
export const listUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  summary: 'ユーザー一覧取得',
  description: '全ユーザーの一覧を取得します',
  tags: ['users'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UsersListResponseSchema,
        },
      },
      description: 'ユーザー一覧を返却',
    },
  },
})

// GET /users/:id - ユーザー詳細取得
export const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  summary: 'ユーザー詳細取得',
  description: '指定されたIDのユーザー情報を取得します',
  tags: ['users'],
  request: {
    params: UserSchema.pick({ id: true }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'ユーザー情報を返却',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'ユーザーが見つかりません',
    },
  },
})

// POST /users - ユーザー作成
export const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  summary: 'ユーザー作成',
  description: '新しいユーザーを作成します',
  tags: ['users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: '作成されたユーザー情報を返却',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'バリデーションエラー',
    },
  },
})
