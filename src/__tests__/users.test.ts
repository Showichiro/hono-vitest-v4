import { describe, expect, test } from 'vitest'
import app from '../index'
import {
  UserSchema,
  UsersListResponseSchema,
  CreateUserRequestSchema,
  ErrorResponseSchema,
} from '../schemas/user'

describe('Users API - スキーマ駆動テスト', () => {
  describe('GET /users - ユーザー一覧取得', () => {
    test('正しいスキーマのレスポンスを返す', async () => {
      const res = await app.request('/users')

      expect(res.status).toBe(200)

      const data = await res.json()

      // expect.schemaMatchingでレスポンス全体を検証
      expect(data).toEqual(expect.schemaMatching(UsersListResponseSchema))
    })

    test('users配列の各要素がUserSchemaに準拠', async () => {
      const res = await app.request('/users')
      const data = await res.json()

      // 各ユーザーがUserSchemaに準拠していることを検証
      data.users.forEach((user: any) => {
        expect(user).toEqual(expect.schemaMatching(UserSchema))
      })
    })

    test('total値が正しい型', async () => {
      const res = await app.request('/users')
      const data = await res.json()

      expect(data).toMatchObject({
        total: expect.schemaMatching(UsersListResponseSchema.shape.total),
      })
    })
  })

  describe('GET /users/:id - ユーザー詳細取得', () => {
    test('存在するユーザーIDで正しいスキーマのレスポンスを返す', async () => {
      const res = await app.request('/users/1')

      expect(res.status).toBe(200)

      const data = await res.json()

      // UserSchemaに準拠したレスポンスが返ることを検証
      expect(data).toEqual(expect.schemaMatching(UserSchema))
    })

    test('特定のユーザー情報を検証', async () => {
      const res = await app.request('/users/1')
      const data = await res.json()

      // 個別フィールドのスキーマ検証
      expect(data).toMatchObject({
        id: expect.schemaMatching(UserSchema.shape.id),
        name: expect.schemaMatching(UserSchema.shape.name),
        email: expect.schemaMatching(UserSchema.shape.email),
        createdAt: expect.schemaMatching(UserSchema.shape.createdAt),
      })
    })

    test('存在しないユーザーIDでエラースキーマを返す', async () => {
      const res = await app.request('/users/999')

      expect(res.status).toBe(404)

      const data = await res.json()

      // ErrorResponseSchemaに準拠したエラーレスポンスが返ることを検証
      expect(data).toEqual(expect.schemaMatching(ErrorResponseSchema))
    })
  })

  describe('POST /users - ユーザー作成', () => {
    test('正しいリクエストで新規ユーザーを作成', async () => {
      const newUser = {
        name: '鈴木一郎',
        email: 'suzuki@example.com',
        age: 28,
      }

      // リクエストボディがCreateUserRequestSchemaに準拠
      expect(newUser).toEqual(expect.schemaMatching(CreateUserRequestSchema))

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      expect(res.status).toBe(201)

      const data = await res.json()

      // レスポンスがUserSchemaに準拠
      expect(data).toEqual(expect.schemaMatching(UserSchema))

      // 作成されたユーザーの情報が正しい
      expect(data).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
      })

      // IDとcreatedAtが自動生成されている
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('createdAt')
    })

    test('年齢なしでもユーザーを作成可能（optionalフィールド）', async () => {
      const newUser = {
        name: '田中次郎',
        email: 'tanaka@example.com',
      }

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      expect(res.status).toBe(201)

      const data = await res.json()

      // レスポンスがUserSchemaに準拠（ageがなくてもOK）
      expect(data).toEqual(expect.schemaMatching(UserSchema))
    })
  })

  describe('スキーマバリデーション - 不正なデータ', () => {
    test('無効なメールアドレスはスキーマに準拠しない', () => {
      const invalidUser = {
        id: '1',
        name: 'Test User',
        email: 'invalid-email', // 無効なメール
        createdAt: '2025-01-01T00:00:00Z',
      }

      // スキーマ検証が失敗することを期待
      expect(() => {
        UserSchema.parse(invalidUser)
      }).toThrow()
    })

    test('必須フィールド欠落はスキーマに準拠しない', () => {
      const invalidUser = {
        email: 'test@example.com',
        // nameフィールドがない
      }

      expect(() => {
        CreateUserRequestSchema.parse(invalidUser)
      }).toThrow()
    })
  })
})
