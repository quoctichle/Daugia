import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
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
    
    const uploadDir = join(process.cwd(), 'public', 'uploads');
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