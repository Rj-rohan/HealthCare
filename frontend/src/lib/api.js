export function getApiBase() {
  const env = import.meta?.env?.VITE_API_BASE_URL
  if (env && typeof env === 'string' && env.trim()) {
    return env.trim().replace(/\/$/, '')
  }
  // Always use backend server URL
  return 'http://localhost:8000'
}

export async function apiFetch(path, options = {}) {
  const base = getApiBase()
  const safePath = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${safePath}`
  
  // Ensure credentials are always included
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }
  
  return fetch(url, defaultOptions)
}
