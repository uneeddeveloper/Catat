import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

let client: S3Client | undefined

function useR2() {
  if (!client) {
    const config = useRuntimeConfig()
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey
      }
    })
  }
  return client
}

export async function uploadReceiptImage(key: string, body: Buffer, contentType: string) {
  return uploadFile(key, body, contentType)
}

export async function uploadReportFile(key: string, body: Buffer, contentType: string) {
  return uploadFile(key, body, contentType)
}

async function uploadFile(key: string, body: Buffer, contentType: string) {
  const config = useRuntimeConfig()
  await useR2().send(new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    Body: body,
    ContentType: contentType
  }))
  return `${config.r2PublicUrl.replace(/\/$/, '')}/${key}`
}
