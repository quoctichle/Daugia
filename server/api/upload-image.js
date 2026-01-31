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

    // Kiểm tra kích thước file (tối đa 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (image.data.length > MAX_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ảnh vượt quá dung lượng tối đa 5MB.'
      });
    }

    // Chỉ cho phép định dạng ảnh phổ biến
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = extname(image.filename).toLowerCase();
    if (!allowedExt.includes(fileExtension)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Chỉ cho phép upload ảnh jpg, jpeg, png, webp.'
      });
    }

    // Gợi ý: Có thể nén ảnh trước khi lưu để tối ưu dung lượng (dùng sharp hoặc jimp nếu cần)

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}${fileExtension}`;
    
    let uploadDir;
    if (process.env.VERCEL || process.env.LAMBDA_TASK_ROOT) {
      uploadDir = join('/tmp', 'uploads');
    } else {
      uploadDir = join(process.cwd(), 'public', 'uploads');
    }
    const filepath = join(uploadDir, filename);

    // Ensure uploads folder exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(filepath, image.data);

    // Return the public path
    return { path: `/api/uploads/${filename}` };
    
  } catch (error) {
    console.error('Upload error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Upload failed',
      data: error.message,
    });
  }
});