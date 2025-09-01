export function getApiBase() {
  const env = import.meta?.env?.VITE_API_BASE_URL
  if (env && typeof env === 'string' && env.trim()) {
    return env.trim().replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
}

export async function apiFetch(path, options = {}) {
  const base = getApiBase()
  const safePath = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${safePath}`
  return fetch(url, options)
}
