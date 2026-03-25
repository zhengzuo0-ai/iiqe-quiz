import { scheduleSync } from './supabase'

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
    scheduleSync()
  } catch {}
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {}
}

export function removeByPrefix(keyPrefix) {
  try {
    const fullPrefix = PREFIX + keyPrefix
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(fullPrefix)) keysToRemove.push(k)
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  } catch {}
}

export function keys() {
  try {
    const result = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) result.push(k.slice(PREFIX.length))
    }
    return result
  } catch {
    return []
  }
}
