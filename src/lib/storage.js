const PREFIX = 'iiqe_qq_'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch {}
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {}
}
