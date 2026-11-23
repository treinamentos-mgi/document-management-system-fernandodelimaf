const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../config/uploadConfig');

const documents = new Map();
const storageNamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getStoragePath(storageName) {
  if (typeof storageName !== 'string' || !storageNamePattern.test(storageName)) {
    throw new Error('Nome interno de armazenamento inválido');
  }

  const filePath = path.resolve(storageDirectory, storageName);
  const relativePath = path.relative(storageDirectory, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Caminho de armazenamento fora do diretório permitido');
  }

  return filePath;
}

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findById(id) {
  return documents.get(id) || null;
}

function findByOwner(owner) {
  return [...documents.values()].filter((document) => document.owner === owner);
}

async function openDownloadById(id) {
  const document = findById(id);
  if (!document) {
    return null;
  }

  let fileHandle;

  try {
    fileHandle = await fs.open(getStoragePath(document.storageName), 'r');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }

  try {
    const stats = await fileHandle.stat();
    return {
      stream: fileHandle.createReadStream(),
      originalName: document.originalName,
      size: stats.size,
    };
  } catch (error) {
    await fileHandle.close();
    throw error;
  }
}

async function restrictFilePermissions(filename) {
  await fs.chmod(getStoragePath(filename), 0o600);
}

async function removeUploadedFile(filename) {
  if (!filename) {
    return;
  }

  try {
    await fs.unlink(getStoragePath(filename));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  findById,
  findByOwner,
  openDownloadById,
  restrictFilePermissions,
  removeUploadedFile,
  save,
};