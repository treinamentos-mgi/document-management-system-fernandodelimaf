async function getErrorMessage(response) {
  try {
    const payload = await response.json();
    return payload.error?.message || 'Não foi possível concluir a operação.';
  } catch {
    return 'Não foi possível concluir a operação.';
  }
}

export async function uploadDocument(file, ownerId) {
  const formData = new FormData();
  formData.append('ownerId', ownerId);
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function listDocuments(ownerId) {
  const query = new URLSearchParams({ ownerId });
  const response = await fetch(`/api/documents?${query}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function downloadDocument(documentMetadata) {
  const response = await fetch(
    `/api/documents/${encodeURIComponent(documentMetadata.id)}/download`,
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = documentMetadata.originalName;
  link.hidden = true;
  window.document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}