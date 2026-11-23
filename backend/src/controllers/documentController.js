const documentService = require('../services/documentService');

async function uploadDocument(req, res) {
  if (!req.file) {
    const error = new Error('Envie um arquivo no campo file');
    error.statusCode = 400;
    error.errorCode = 'file_required';
    throw error;
  }

  const document = await documentService.createDocument(req.file, req.body.ownerId);
  res.status(201).json(document);
}

function listDocuments(req, res) {
  res.json(documentService.listDocuments(req.query.ownerId));
}

async function downloadDocument(req, res, next) {
  const download = await documentService.getDownload(req.params.id);

  res.attachment(download.originalName);
  res.type('application/octet-stream');
  res.setHeader('Content-Length', download.size);
  download.stream.on('error', (error) => {
    if (res.headersSent) {
      res.destroy(error);
    } else {
      next(error);
    }
  });
  download.stream.pipe(res);
}

module.exports = {
  downloadDocument,
  listDocuments,
  uploadDocument,
};