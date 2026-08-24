import { customType } from 'drizzle-orm/mysql-core'
import { encrypt, decrypt } from '../utils/encryption'

/**
 * Kolom text yang otomatis dienkripsi (AES-256-GCM) saat ditulis dan
 * didekripsi saat dibaca, transparan untuk semua db.select()/insert()/update()
 * yang sudah ada. Key dari DATA_ENCRYPTION_KEY (lihat server/utils/encryption.ts).
 */
export const encryptedText = customType<{ data: string, driverData: string }>({
  dataType() {
    return 'text'
  },
  toDriver(value) {
    return value == null ? value : encrypt(value)
  },
  fromDriver(value) {
    return value == null ? value : decrypt(value)
  }
})

export const encryptedJson = <T>() => customType<{ data: T, driverData: string }>({
  dataType() {
    return 'text'
  },
  toDriver(value) {
    return value == null ? value as unknown as string : encrypt(JSON.stringify(value))
  },
  fromDriver(value) {
    return value == null ? value as unknown as T : JSON.parse(decrypt(value))
  }
})
