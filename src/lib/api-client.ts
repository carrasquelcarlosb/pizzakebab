const DEFAULT_API_BASE_URL = "http://localhost:4000"
const DEFAULT_TENANT_ID = "pizzakebab"

const resolveBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")
  }
  if (typeof window !== "undefined") {
    const fromGlobal = (window as typeof window & { __API_BASE_URL__?: string }).__API_BASE_URL__
    if (fromGlobal) {
      return fromGlobal.replace(/\/$/, "")
    }
  }
  return DEFAULT_API_BASE_URL
}

const resolveTenantId = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TENANT_ID) {
    return process.env.NEXT_PUBLIC_TENANT_ID
  }
  return DEFAULT_TENANT_ID
}

const buildUrl = (baseUrl: string, path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export class ApiError extends Error {
  public readonly status: number
  public readonly detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

export async function apiFetch<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const baseUrl = resolveBaseUrl()
  const tenantId = resolveTenantId()

  const headers = new Headers(init.headers ?? {})
  if (!headers.has("accept")) {
    headers.set("accept", "application/json")
  }
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }
  headers.set("x-tenant-id", tenantId)

  const response = await fetch(buildUrl(baseUrl, path), {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => undefined)
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status, detail)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

