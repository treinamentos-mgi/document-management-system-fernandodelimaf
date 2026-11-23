const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');

const storageDirectory = path.resolve(__dirname, '../storage');
let server;
let baseUrl;
const uploadedFiles = new Set();

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  await Promise.all(
    [...uploadedFiles].map((filename) => fs.unlink(path.join(storageDirectory, filename))),
  );
});

function trackUploadedFile(document) {
  const storedDocument = documentRepository.findById(document.id);
  assert.ok(storedDocument);
  uploadedFiles.add(storedDocument.storageName);
  return storedDocument.storageName;
}

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload com nome adversarial, lista por dono e baixa um documento', async () => {
  const formData = new FormData();
  formData.set('ownerId', 'user-1');
  formData.set('file', new Blob(['conteudo de teste'], { type: 'text/plain' }), '../../arquivo.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  const storedFilename = trackUploadedFile(document);
  assert.deepEqual(Object.keys(document), ['id', 'originalName', 'size', 'uploadedAt', 'owner']);
  assert.equal(document.originalName, 'arquivo.txt');
  assert.equal(document.size, Buffer.byteLength('conteudo de teste'));
  assert.equal(document.owner, 'user-1');

  assert.match(storedFilename, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  const storedFileStats = await fs.stat(path.join(storageDirectory, storedFilename));
  assert.equal(storedFileStats.mode & 0o777, 0o600);

  const listResponse = await fetch(`${baseUrl}/documents?ownerId=user-1`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [document]);

  const otherOwnerResponse = await fetch(`${baseUrl}/documents?ownerId=user-2`);
  assert.deepEqual(await otherOwnerResponse.json(), []);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.equal(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /arquivo\.txt/);
  assert.equal(await downloadResponse.text(), 'conteudo de teste');
});

test('lista documentos apenas do dono solicitado e baixa conteúdo binário', async () => {
  const content = Buffer.from([0, 1, 127, 128, 255]);
  const documents = [];

  for (const ownerId of ['owner-a', 'owner-b']) {
    const formData = new FormData();
    formData.set('ownerId', ownerId);
    formData.set('file', new Blob([content], { type: 'application/octet-stream' }), 'dados.bin');
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
    assert.equal(response.status, 201);
    const document = await response.json();
    trackUploadedFile(document);
    documents.push(document);
  }

  for (const [index, ownerId] of ['owner-a', 'owner-b'].entries()) {
    const response = await fetch(`${baseUrl}/documents?ownerId=${ownerId}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [documents[index]]);
  }

  const response = await fetch(`${baseUrl}/documents/${documents[1].id}/download`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/octet-stream');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), content);
});

test('retorna erros para dados obrigatórios ausentes e documento inexistente', async () => {
  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.equal(listResponse.status, 400);
  assert.equal((await listResponse.json()).error.code, 'owner_id_required');

  const formData = new FormData();
  formData.set('ownerId', 'user-1');
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
  assert.equal(uploadResponse.status, 400);
  assert.equal((await uploadResponse.json()).error.code, 'file_required');

  const missingOwner = new FormData();
  missingOwner.set('file', new Blob(['content'], { type: 'text/plain' }), 'arquivo.txt');
  const missingOwnerResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: missingOwner,
  });
  assert.equal(missingOwnerResponse.status, 400);
  assert.equal((await missingOwnerResponse.json()).error.code, 'owner_id_required');

  const excessiveFields = new FormData();
  excessiveFields.set('ownerId', 'user-1');
  excessiveFields.set('unexpected', 'value');
  excessiveFields.set('file', new Blob(['content'], { type: 'text/plain' }), 'arquivo.txt');
  const excessiveFieldsResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: excessiveFields,
  });
  assert.equal(excessiveFieldsResponse.status, 400);
  assert.equal((await excessiveFieldsResponse.json()).error.code, 'too_many_fields');

  const downloadResponse = await fetch(`${baseUrl}/documents/missing/download`);
  assert.equal(downloadResponse.status, 404);
  assert.equal((await downloadResponse.json()).error.code, 'document_not_found');
});
