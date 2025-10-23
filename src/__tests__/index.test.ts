import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import app from '../index'

describe('Hono App API Tests', () => {
  test('GET / returns Hello Hono! with correct schema', async () => {
    // リクエストを実行
    const res = await app.request('/')

    // ステータスコードの検証
    expect(res.status).toBe(200)

    // Content-Typeの検証
    expect(res.headers.get('Content-Type')).toBe('text/plain;charset=UTF-8')

    // レスポンスボディの検証
    const text = await res.text()
    expect(text).toBe('Hello Hono!')

    // expect.schemaMatchingを使用した検証
    expect(text).toEqual(expect.schemaMatching(z.string().min(1)))
  })

  test('GET / response matches specific string pattern schema', async () => {
    const res = await app.request('/')
    const text = await res.text()

    // より具体的なスキーマで検証
    const helloSchema = z.string().regex(/^Hello/)
    expect(text).toEqual(expect.schemaMatching(helloSchema))
  })

  test('Response object structure validation with schemaMatching', async () => {
    const res = await app.request('/')

    // レスポンスオブジェクトのスキーマ定義
    const responseSchema = z.object({
      status: z.number().int().min(200).max(599),
      ok: z.boolean(),
      statusText: z.string(),
    })

    // レスポンスオブジェクトの一部を検証
    const responseData = {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
    }

    expect(responseData).toEqual(expect.schemaMatching(responseSchema))
  })

  test('Multiple assertions with schemaMatching', async () => {
    const res = await app.request('/')
    const text = await res.text()

    // 複数のスキーマを使った検証
    expect({
      status: res.status,
      body: text,
    }).toEqual({
      status: expect.schemaMatching(z.literal(200)),
      body: expect.schemaMatching(z.string().includes('Hono')),
    })
  })
})
