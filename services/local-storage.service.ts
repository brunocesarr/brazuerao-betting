import CryptoJS, { AES } from 'crypto-js'

// ============================================================================
// TYPES
// ============================================================================

interface StoredValue<T> {
  value: T
  date: string
}

interface LocalStorageConfig {
  encryptionKey: string
  defaultTTL: number // Time to live in seconds
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONFIG: LocalStorageConfig = {
  encryptionKey: process.env.NEXT_PUBLIC_STORAGE_KEY || 'sw',
  defaultTTL: 2 * 60 * 60, // 2 hours
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Encrypt data
 */
function encrypt(data: string, key: string): string {
  return AES.encrypt(data, key).toString()
}

/**
 * Decrypt data
 */
function decrypt(encryptedData: string, key: string): string {
  const bytes = AES.decrypt(encryptedData, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Check if storage is expired
 */
function isExpired(storedDate: string, ttlSeconds: number): boolean {
  const limitTime = new Date()
  limitTime.setSeconds(limitTime.getSeconds() + ttlSeconds)

  const storedTime = new Date(storedDate)

  return storedTime.getTime() > limitTime.getTime()
}

// ============================================================================
// STORAGE SERVICE
// ============================================================================

/**
 * Get item from localStorage with decryption and expiration check
 */
function getItem<T = unknown>(
  key: string,
  validStorageTimeInSeconds: number = CONFIG.defaultTTL
): T | null {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const encryptedItem = localStorage.getItem(key)

    if (!encryptedItem) {
      return null
    }

    // Decrypt
    const decryptedData = decrypt(encryptedItem, CONFIG.encryptionKey)
    const storedValue: StoredValue<T> = JSON.parse(decryptedData)

    // Check expiration
    if (isExpired(storedValue.date, validStorageTimeInSeconds)) {
      localStorage.removeItem(key)
      return null
    }

    return storedValue.value
  } catch (error) {
    console.error(`[LocalStorage] Error getting item "${key}":`, error)
    // Clean up corrupted data
    localStorage.removeItem(key)
    return null
  }
}

/**
 * Set item in localStorage with encryption
 */
function setItem<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') {
      return
    }

    const storedValue: StoredValue<T> = {
      value,
      date: new Date().toISOString(),
    }

    const serialized = JSON.stringify(storedValue)
    const encrypted = encrypt(serialized, CONFIG.encryptionKey)

    localStorage.setItem(key, encrypted)
  } catch (error) {
    console.error(`[LocalStorage] Error setting item "${key}":`, error)
  }
}

/**
 * Remove item from localStorage
 */
function deleteItem(key: string): void {
  try {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.removeItem(key)
  } catch (error) {
    console.error(`[LocalStorage] Error deleting item "${key}":`, error)
  }
}

/**
 * Clear all items from localStorage
 */
function clear(): void {
  try {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.clear()
  } catch (error) {
    console.error('[LocalStorage] Error clearing storage:', error)
  }
}

/**
 * Check if item exists
 */
function hasItem(key: string): boolean {
  try {
    if (typeof window === 'undefined') {
      return false
    }

    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

/**
 * Get item without expiration check
 */
function getItemRaw<T = unknown>(key: string): T | null {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const encryptedItem = localStorage.getItem(key)

    if (!encryptedItem) {
      return null
    }

    const decryptedData = decrypt(encryptedItem, CONFIG.encryptionKey)
    const storedValue: StoredValue<T> = JSON.parse(decryptedData)

    return storedValue.value
  } catch (error) {
    console.error(`[LocalStorage] Error getting raw item "${key}":`, error)
    return null
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const localStorageService = {
  getItem,
  setItem,
  deleteItem,
  clear,
  hasItem,
  getItemRaw,
}

export default localStorageService

// Named exports for convenience
export { clear, deleteItem, getItem, hasItem, setItem }
