const API_BASE = '/backend/api.php'

async function request(action, payload = {}, method = 'POST') {
  const response = await fetch(`${API_BASE}?action=${encodeURIComponent(action)}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: method === 'GET' ? undefined : JSON.stringify(payload),
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('The backend is unavailable. Please start the PHP API on port 8001.')
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.')
  }

  return data
}

export async function login(username, password) {
  const result = await request('login', { username, password }, 'POST')

  if (!result || !result.user) {
    throw new Error('Login response was invalid.')
  }

  return result
}

export async function getDashboardData(user) {
  if (!user || !user.role) {
    throw new Error('User session is missing.')
  }

  return request('dashboard', { role: user.role }, 'POST')
}
