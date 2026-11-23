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
    const uploadErrors = {
      LIMIT_FILE_SIZE: [413, 'file_too_large', 'O arquivo excede o tamanho máximo permitido'],
      LIMIT_FILE_COUNT: [400, 'too_many_files', 'Envie somente um arquivo'],
      LIMIT_FIELD_COUNT: [400, 'too_many_fields', 'O upload contém campos demais'],
      LIMIT_PART_COUNT: [400, 'too_many_parts', 'O upload contém partes demais'],
      LIMIT_FIELD_KEY: [400, 'field_name_too_large', 'O nome de um campo é muito longo'],
      LIMIT_FIELD_VALUE: [400, 'field_value_too_large', 'O valor de um campo é muito longo'],
      LIMIT_UNEXPECTED_FILE: [400, 'unexpected_file', 'O campo de arquivo não é permitido'],
    };
    [statusCode, errorCode, message] = uploadErrors[error.code]
      || [400, 'invalid_upload', 'O upload enviado é inválido'];
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
    },
  });
}

module.exports = errorHandler;