import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import mime from 'mime-types';

export default defineEventHandler(async (event) => {
  const path = event.context.params.path;
  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'No file specified.' });
  }

  // Determine the base upload directory
  let uploadDir;
  if (process.env.VERCEL || process.env.LAMBDA_TASK_ROOT) {
    uploadDir = join('/tmp', 'uploads');
  } else {
    uploadDir = join(process.cwd(), 'public', 'uploads');
  }

  const filePath = join(uploadDir, path);

  if (!existsSync(filePath)) {
    console.error(`File not found at path: ${filePath}`);
    throw createError({ statusCode: 404, statusMessage: 'File not found.' });
  }

  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  setResponseHeader(event, 'Content-Type', contentType);

  return sendStream(event, createReadStream(filePath));
});
