import { writeFile, mkdir } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readMultipartFormData } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const multipart = await readMultipartFormData(event);
    
    const image = multipart?.find(el => el.name === 'image');

    if (!image || !image.data || !image.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No image file provided or file is invalid.',
      });
    }

    // Generate unique filename
    const fileExtension = extname(image.filename);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}${fileExtension}`;
    
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const uploadDir = process.env.VERCEL
      ? join('/tmp', 'uploads')
      : join(__dirname, '..', '..', 'public', 'uploads');
    const filepath = join(uploadDir, filename);

    // Ensure uploads folder exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(filepath, image.data);

    // Return the public path
    return { path: `/uploads/${filename}` };
    
  } catch (error) {
    console.error('Upload error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Upload failed',
      data: error.message,
    });
  }
});