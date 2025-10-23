import { z } from '@hono/zod-openapi'

// ユーザースキーマ
export const UserSchema = z.object({
  id: z.string().openapi({
    example: '123',
    description: 'ユーザーID',
  }),
  name: z.string().min(1).max(100).openapi({
    example: '山田太郎',
    description: 'ユーザー名',
  }),
  email: z.string().email().openapi({
    example: 'yamada@example.com',
    description: 'メールアドレス',
  }),
  age: z.number().int().min(0).max(150).optional().openapi({
    example: 25,
    description: '年齢',
  }),
  createdAt: z.string().datetime().openapi({
    example: '2025-01-01T00:00:00Z',
    description: '作成日時',
  }),
})

// ユーザー作成リクエストスキーマ
export const CreateUserRequestSchema = z.object({
  name: z.string().min(1).max(100).openapi({
    example: '山田太郎',
    description: 'ユーザー名',
  }),
  email: z.string().email().openapi({
    example: 'yamada@example.com',
    description: 'メールアドレス',
  }),
  age: z.number().int().min(0).max(150).optional().openapi({
    example: 25,
    description: '年齢',
  }),
})

// ユーザー一覧レスポンススキーマ
export const UsersListResponseSchema = z.object({
  users: z.array(UserSchema).openapi({
    description: 'ユーザーの配列',
  }),
  total: z.number().int().openapi({
    example: 10,
    description: '総ユーザー数',
  }),
})

// エラーレスポンススキーマ
export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Bad Request',
    description: 'エラーメッセージ',
  }),
  message: z.string().optional().openapi({
    example: '詳細なエラー説明',
    description: 'エラー詳細',
  }),
})

// 型のエクスポート
export type User = z.infer<typeof UserSchema>
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
