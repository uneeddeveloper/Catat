export async function sendFonnteMessage(params: { target: string, message: string }) {
  const config = useRuntimeConfig()
  await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': config.fonnteApiToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ target: params.target, message: params.message })
  })
}

export interface FonnteDeviceInfo {
  ok: boolean
  device?: string
  name?: string
  package?: string
  quota?: number
  messages?: number
  deviceStatus?: string
  expired?: string
  error?: string
}

export async function getFonnteDeviceInfo(): Promise<FonnteDeviceInfo> {
  const config = useRuntimeConfig()
  if (!config.fonnteApiToken) {
    return { ok: false, error: 'Token Fonnte belum diatur' }
  }

  try {
    const response = await fetch('https://api.fonnte.com/device', {
      method: 'POST',
      headers: { Authorization: config.fonnteApiToken }
    })
    const data = await response.json() as Record<string, unknown>

    if (!data?.status) {
      return { ok: false, error: typeof data?.reason === 'string' ? data.reason : 'Gagal mengambil data device Fonnte' }
    }

    return {
      ok: true,
      device: typeof data.device === 'string' ? data.device : undefined,
      name: typeof data.name === 'string' ? data.name : undefined,
      package: typeof data.package === 'string' ? data.package : undefined,
      quota: data.quota !== undefined ? Number(data.quota) : undefined,
      messages: data.messages !== undefined ? Number(data.messages) : undefined,
      deviceStatus: typeof data.device_status === 'string' ? data.device_status : undefined,
      expired: typeof data.expired === 'string' ? data.expired : undefined
    }
  } catch {
    return { ok: false, error: 'Tidak bisa menghubungi Fonnte' }
  }
}

export async function sendFonnteDocument(params: { target: string, url: string, filename: string, message?: string }) {
  const config = useRuntimeConfig()
  await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': config.fonnteApiToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      target: params.target,
      url: params.url,
      filename: params.filename,
      message: params.message ?? ''
    })
  })
}
