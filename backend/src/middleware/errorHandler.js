const multer = require('multer');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  let statusCode = error.statusCode || 500;
  let errorCode = error.errorCode || 'internal_server_error';
  let message = statusCode < 500 ? error.message : 'Erro interno do servidor';

  if (error instanceof multer.MulterError) {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    errorCode = error.code === 'LIMIT_FILE_SIZE' ? 'file_too_large' : 'invalid_upload';
    message = error.code === 'LIMIT_FILE_SIZE'
      ? 'O arquivo excede o tamanho máximo permitido'
      : 'O upload enviado é inválido';
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
    },
  });
}

module.exports = errorHandler;