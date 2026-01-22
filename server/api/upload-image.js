import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  console.log('Upload API called')
  try {
    const body = await readBody(event)
    const { image } = body

    if (!image || !image.startsWith('data:image/')) {
      console.log('No base64 image')
      throw createError({
        statusCode: 400,
        statusMessage: 'No image provided'
      })
    }

    console.log('Base64 received')

    // Extract base64 data
    const base64Data = image.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const filename = `${Date.now()}-image.png`
    const filepath = join(process.cwd(), 'public', 'uploads', filename)
    console.log('Filepath:', filepath)

    // Ensure uploads folder exists
    const fs = await import('fs/promises')
    await fs.mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true })
    console.log('Folder created')

    // Write file
    await writeFile(filepath, buffer)
    console.log('File written')

    return { path: `/uploads/${filename}` }
  } catch (error) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Upload failed',
      data: error.message
    })
  }
})