const crypto = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

function createError(statusCode, errorCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
}

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

async function createDocument(file, ownerId) {
  const owner = typeof ownerId === 'string' ? ownerId.trim() : '';

  if (!owner) {
    await documentRepository.removeUploadedFile(file.filename);
    throw createError(400, 'owner_id_required', 'O campo ownerId é obrigatório');
  }

  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  };

  try {
    return toPublicDocument(documentRepository.save(document));
  } catch (error) {
    await documentRepository.removeUploadedFile(file.filename);
    throw error;
  }
}

function listDocuments(ownerId) {
  const owner = typeof ownerId === 'string' ? ownerId.trim() : '';

  if (!owner) {
    throw createError(400, 'owner_id_required', 'O parâmetro ownerId é obrigatório');
  }

  return documentRepository.findByOwner(owner).map(toPublicDocument);
}

async function getDownload(id) {
  const download = await documentRepository.findDownloadById(id);

  if (!download) {
    throw createError(404, 'document_not_found', 'Documento não encontrado');
  }

  return download;
}

module.exports = {
  createDocument,
  getDownload,
  listDocuments,
};