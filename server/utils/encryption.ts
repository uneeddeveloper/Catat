import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

let key: Buffer | undefined

function getKey() {
  if (!key) {
    // process.env langsung (bukan useRuntimeConfig) supaya bisa dipakai juga
    // di script standalone (tsx) di luar runtime Nitro, mis. scripts/encrypt-existing-data.ts
    const raw = process.env.DATA_ENCRYPTION_KEY
    if (!raw) {
      throw new Error('DATA_ENCRYPTION_KEY belum diset di environment')
    }
    const decoded = Buffer.from(raw, 'base64')
    if (decoded.length !== 32) {
      throw new Error('DATA_ENCRYPTION_KEY harus berupa 32 byte random dalam base64 (contoh: openssl rand -base64 32)')
    }
    key = decoded
  }
  return key
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, IV_LENGTH)
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
