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
