import sharp from 'sharp'

export async function resizeReceiptImage(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer()
}
