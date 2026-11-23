const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../config/uploadConfig');

const documents = new Map();

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

async function findDownloadById(id) {
  const document = findById(id);
  if (!document) {
    return null;
  }

  const filePath = path.join(storageDirectory, document.storageName);

  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }

  return { filePath, originalName: document.originalName };
}

async function removeUploadedFile(filename) {
  if (!filename || path.basename(filename) !== filename) {
    return;
  }

  try {
    await fs.unlink(path.join(storageDirectory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  findById,
  findByOwner,
  findDownloadById,
  removeUploadedFile,
  save,
};