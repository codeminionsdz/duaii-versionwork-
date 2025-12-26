import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the server Supabase client used by app/actions/notifications.ts
vi.mock('@/lib/supabase/server', () => {
  // Internal mock state
  let currentUser: { id: string } | null = null
  let lastEqCalls: Array<{ table: string; col: string; val: any }> = []
  let responseFor: Record<string, any> = {}

  function reset() {
    currentUser = null
    lastEqCalls = []
    responseFor = {}
  }

  function __setUser(user: { id: string } | null) {
    currentUser = user
  }

  function __setResponse(table: string, resp: any) {
    responseFor[table] = resp
  }

  function __getEqCalls() {
    return lastEqCalls.slice()
  }

  function createClient() {
    return {
      auth: {
        getUser: async () => ({ data: { user: currentUser } }),
      },
      from(table: string) {
        const builder: any = {
          _table: table,
          _action: 'select',
          eqCalls: [] as any[],
          select(..._args: any[]) {
            builder._action = 'select'
            return builder
          },
          order() {
            return builder
          },
          limit() {
            return builder
          },
          update(_payload: any) {
            builder._action = 'update'
            builder._payload = _payload
            return builder
          },
          delete() {
            builder._action = 'delete'
            return builder
          },
          eq(col: string, val: any) {
            builder.eqCalls.push({ col, val })
            lastEqCalls.push({ table, col, val })
            return builder
          },
          // Make the builder awaitable by providing then
          then(onFulfilled: any) {
            // Determine response based on action and table
            const resp = (() => {
              // If a custom response provided for table, use it
              if (responseFor[table] !== undefined) return responseFor[table]

              // Defaults depending on action
              if (builder._action === 'select') return { data: [], error: null }
              return { data: null, error: null }
            })()

            // Simulate a Promise that resolves to resp
            return Promise.resolve(resp).then(onFulfilled)
          },
        }

        return builder
      },
    }
  }

  return {
    createClient,
    __setUser,
    __setResponse,
    __getEqCalls,
    __reset: reset,
  }
})

// Import the module under test after mocking
import * as notifications from '../app/actions/notifications'
import * as supabaseMock from '@/lib/supabase/server'

beforeEach(() => {
  // Reset mock state
  ;(supabaseMock as any).__reset()
})

describe('notifications security', () => {
  it('throws if user is not authenticated (getNotifications)', async () => {
    ;(supabaseMock as any).__setUser(null)

    await expect(notifications.getNotifications()).rejects.toThrow('Not authenticated')
  })

  it('scopes getNotifications to authenticated user id', async () => {
    ;(supabaseMock as any).__setUser({ id: 'user-123' })
    ;(supabaseMock as any).__setResponse('notifications', { data: [{ id: 'n1' }], error: null })

    const data = await notifications.getNotifications()
    expect(Array.isArray(data)).toBe(true)

    const eqCalls = (supabaseMock as any).__getEqCalls()
    expect(eqCalls.some((c: any) => c.col === 'user_id' && c.val === 'user-123')).toBe(true)
  })

  it('scopes getUnreadCount to authenticated user id', async () => {
    ;(supabaseMock as any).__setUser({ id: 'user-xyz' })
    ;(supabaseMock as any).__setResponse('notifications', { count: 5, error: null })

    const count = await notifications.getUnreadCount()
    expect(typeof count === 'number').toBe(true)

    const eqCalls = (supabaseMock as any).__getEqCalls()
    expect(eqCalls.some((c: any) => c.col === 'user_id' && c.val === 'user-xyz')).toBe(true)
    expect(eqCalls.some((c: any) => c.col === 'read' && c.val === false)).toBe(true)
  })

  it('markAsRead scopes update to authenticated user and notification id', async () => {
    ;(supabaseMock as any).__setUser({ id: 'u-1' })
    ;(supabaseMock as any).__setResponse('notifications', { error: null })

    await notifications.markAsRead('notif-1')

    const eqCalls = (supabaseMock as any).__getEqCalls()
    expect(eqCalls.some((c: any) => c.col === 'id' && c.val === 'notif-1')).toBe(true)
    expect(eqCalls.some((c: any) => c.col === 'user_id' && c.val === 'u-1')).toBe(true)
  })

  it('markAllAsRead scopes update to authenticated user', async () => {
    ;(supabaseMock as any).__setUser({ id: 'u-9' })
    ;(supabaseMock as any).__setResponse('notifications', { error: null })

    await notifications.markAllAsRead()

    const eqCalls = (supabaseMock as any).__getEqCalls()
    expect(eqCalls.some((c: any) => c.col === 'user_id' && c.val === 'u-9')).toBe(true)
    expect(eqCalls.some((c: any) => c.col === 'read' && c.val === false)).toBe(true)
  })

  it('deleteNotification scopes deletion to authenticated user and notification id', async () => {
    ;(supabaseMock as any).__setUser({ id: 'u-delete' })
    ;(supabaseMock as any).__setResponse('notifications', { error: null })

    await notifications.deleteNotification('del-1')

    const eqCalls = (supabaseMock as any).__getEqCalls()
    expect(eqCalls.some((c: any) => c.col === 'id' && c.val === 'del-1')).toBe(true)
    expect(eqCalls.some((c: any) => c.col === 'user_id' && c.val === 'u-delete')).toBe(true)
  })

  it('deleteAllNotifications scopes deletion to authenticated user', async () => {
    ;(supabaseMock as any).__setUser({ id: 'u-all' })
    ;(supabaseMock as any).__setResponse('notifications', { error: null })

    await notifications.deleteAllNotifications()

    const eqCalls = (supabaseMock as any).__getEqCalls()
    // There should be an eq on user_id for scoping
    expect(eqCalls.some((c: any) => c.col === 'user_id' && c.val === 'u-all')).toBe(true)
  })
})
