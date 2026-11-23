const crypto = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');
const { allowedMimeTypes, maxFileSizeBytes, storageDirectory } = require('../config/uploadConfig');

fs.mkdirSync(storageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: storageDirectory,
  filename: (req, file, callback) => callback(null, crypto.randomUUID()),
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeBytes, files: 1 },
  fileFilter: (req, file, callback) => {
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error('Tipo de arquivo não permitido');
      error.statusCode = 400;
      error.errorCode = 'unsupported_media_type';
      callback(error);
      return;
    }

    callback(null, true);
  },
});

module.exports = upload;