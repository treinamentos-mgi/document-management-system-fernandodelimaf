const path = require('node:path');

const defaultMaxFileSizeBytes = 10 * 1024 * 1024;
const configuredMaxFileSize = process.env.MAX_UPLOAD_SIZE_BYTES;
const maxFileSizeBytes = configuredMaxFileSize
  ? Number(configuredMaxFileSize)
  : defaultMaxFileSizeBytes;

if (!Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) {
  throw new Error('MAX_UPLOAD_SIZE_BYTES deve ser um inteiro positivo');
}

const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || '')
  .split(',')
  .map((mimeType) => mimeType.trim())
  .filter(Boolean);

module.exports = {
  allowedMimeTypes,
  maxFileSizeBytes,
  storageDirectory: path.resolve(__dirname, '../../storage'),
};