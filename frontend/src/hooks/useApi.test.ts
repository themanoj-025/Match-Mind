import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchJSON, ApiRequestError } from './useApi'

// ─── Mock Response builder ──────────────────────────────
function mockResponse(overrides: Partial<Response> & { status: number; jsonBody?: unknown }): Response {
  const ok = overrides.status >= 200 && overrides.status < 300
  // Build a minimal Response-like object that satisfies the type
  const body = overrides.jsonBody !== undefined ? JSON.stringify(overrides.jsonBody) : '{}'
  const init: ResponseInit = {
    status: overrides.status,
    statusText: overrides.statusText ?? (ok ? 'OK' : 'Error'),
    headers: overrides.headers ?? new Headers({ 'content-type': 'application/json' }),
  }
  return new Response(body, init)
}

function mockFetchSequence(...responses: Array<{ status: number; jsonBody?: unknown }>) {
  let callIndex = 0
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    if (callIndex >= responses.length) {
      throw new Error(`Unexpected fetch call #${callIndex}; only ${responses.length} responses configured`)
    }
    const config = responses[callIndex]
    callIndex++
    return mockResponse(config)
  })
}

// ─── Tests ───────────────────────────────────────────────

describe('fetchJSON', () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    // Make window.location writable for redirect testing
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' } as Location,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  // ── Happy path ─────────────────────────────────────
  it('returns parsed JSON on successful request', async () => {
    const spy = mockFetchSequence({ status: 200, jsonBody: { id: 'm1', homeTeam: 'Team A' } })

    const result = await fetchJSON('/api/matches/1')
    expect(result).toEqual({ id: 'm1', homeTeam: 'Team A' })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  // ── Non-401 errors ─────────────────────────────────
  it('throws ApiRequestError on non-401 error status', async () => {
    mockFetchSequence({ status: 400, jsonBody: { message: 'Invalid input' } })

    const err = await fetchJSON('/api/test').catch((e) => e) as ApiRequestError
    expect(err).toBeInstanceOf(ApiRequestError)
    expect(err.message).toBe('Invalid input')
    expect(err.status).toBe(400)
  })

  it('throws ApiRequestError on 500 with fallback to statusText when JSON body is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      // Use non-JSON body so res.json() throws SyntaxError, triggering the .catch() fallback
      return new Response('not-json', { status: 500, statusText: 'Internal Server Error' })
    })

    const err = await fetchJSON('/api/test').catch((e) => e) as ApiRequestError
    expect(err).toBeInstanceOf(ApiRequestError)
    expect(err.message).toBe('Internal Server Error')
    expect(err.status).toBe(500)
  })

  // ── 401 with successful refresh ────────────────────
  it('retries the request after successful token refresh on 401', async () => {
    const spy = mockFetchSequence(
      { status: 401 },                                               // resource: 401
      { status: 200, jsonBody: { accessToken: 'new-token' } },       // refresh: succeeds
      { status: 200, jsonBody: { data: 'retried-ok' } },              // retry: succeeds
    )

    const result = await fetchJSON('/api/protected-resource')
    expect(result).toEqual({ data: 'retried-ok' })
    expect(spy).toHaveBeenCalledTimes(3)

    // Verify the refresh endpoint was called
    const refreshCallUrl = spy.mock.calls[1][0] as string
    expect(refreshCallUrl).toContain('/api/auth/refresh')
    const refreshCallOpts = spy.mock.calls[1][1] as RequestInit
    expect(refreshCallOpts.method).toBe('POST')
    expect(refreshCallOpts.credentials).toBe('include')
  })

  // ── 401 with failed refresh → redirect ─────────────
  it('redirects to /login when token refresh fails in browser', async () => {
    mockFetchSequence(
      { status: 401 },                              // resource: 401
      { status: 401 },                              // refresh: fails
    )

    const err = await fetchJSON('/api/protected-resource').catch((e) => e) as ApiRequestError
    expect(err).toBeInstanceOf(ApiRequestError)
    expect(err.message).toBe('Session expired')
    expect(err.status).toBe(401)

    // Should have redirected to /login
    expect(window.location.href).toBe('/login')
  })

  // ── 401 with failed refresh (non-browser) ──────────
  it('does not redirect when window is undefined (SSR/non-browser)', async () => {
    // Temporarily remove window for SSR simulation
    const win = globalThis.window
    // @ts-expect-error - deleting window to simulate SSR
    delete globalThis.window

    try {
      mockFetchSequence(
        { status: 401 },
        { status: 401 },
      )

      const err = await fetchJSON('/api/protected-resource').catch((e) => e) as ApiRequestError
      expect(err).toBeInstanceOf(ApiRequestError)
      expect(err.message).toBe('Session expired')
      expect(err.status).toBe(401)
    } finally {
      globalThis.window = win
    }
  })

  // ── 401 with network error during refresh ──────────
  it('handles network error during token refresh gracefully', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.toString().includes('/api/auth/refresh')) {
        throw new TypeError('Network error')
      }
      return mockResponse({ status: 401 })
    })

    const err = await fetchJSON('/api/protected-resource').catch((e) => e) as ApiRequestError
    expect(err).toBeInstanceOf(ApiRequestError)
    expect(err.message).toBe('Session expired')
    expect(spy).toHaveBeenCalledTimes(2)
    expect(window.location.href).toBe('/login')
  })

  // ── Passes request options ─────────────────────────
  it('passes method, body, and custom headers to fetch', async () => {
    mockFetchSequence({ status: 200, jsonBody: { success: true } })

    await fetchJSON('/api/test', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' }),
      headers: { Authorization: 'Bearer token123' },
    })

    const [url, opts] = vi.mocked(globalThis.fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/test')
    expect(opts.method).toBe('POST')
    expect(opts.body).toBe(JSON.stringify({ key: 'value' }))
    expect(opts.credentials).toBe('include')
    // Authorization should be present alongside Content-Type
    const headers = opts.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer token123')
    expect(headers['Content-Type']).toBe('application/json')
  })

  // ── Singleton refresh pattern ─────────────────────
  it('uses singleton refresh pattern (same promise for concurrent requests)', async () => {
    let refreshCount = 0

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = url.toString()

      // Resource endpoints: return 401 before refresh, 200 after
      if (urlStr.includes('/api/resource/') && !urlStr.includes('/api/auth/')) {
        if (refreshCount === 0) {
          return mockResponse({ status: 401 })
        }
        return mockResponse({ status: 200, jsonBody: { data: 'ok' } })
      }

      // Refresh endpoint
      if (urlStr.includes('/api/auth/refresh')) {
        refreshCount++
        return mockResponse({ status: 200, jsonBody: { accessToken: 'new' } })
      }

      return mockResponse({ status: 200, jsonBody: {} })
    })

    // Fire two concurrent requests
    const [res1, res2] = await Promise.all([
      fetchJSON('/api/resource/1'),
      fetchJSON('/api/resource/2'),
    ])

    expect(res1).toEqual({ data: 'ok' })
    expect(res2).toEqual({ data: 'ok' })

    // Refresh should only have been called ONCE for both requests
    expect(refreshCount).toBe(1)
  })
})

describe('ApiRequestError', () => {
  it('creates an error with correct properties', () => {
    const err = new ApiRequestError('Not found', 404)
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiRequestError')
    expect(err.message).toBe('Not found')
    expect(err.status).toBe(404)
  })

  it('is distinguishable from regular Error', () => {
    const apiErr = new ApiRequestError('Bad request', 400)
    const regularErr = new Error('Something broke')

    expect(apiErr).toBeInstanceOf(Error)
    expect(regularErr).toBeInstanceOf(Error)
    expect(apiErr.status).toBe(400)
    expect('status' in regularErr).toBe(false)
  })
})
