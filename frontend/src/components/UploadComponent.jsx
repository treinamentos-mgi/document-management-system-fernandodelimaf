import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ ownerId, onUploaded }) {
  const formRef = useRef(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || !ownerId || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const uploadedDocument = await uploadDocument(file, ownerId);
      setFile(null);
      formRef.current?.reset();
      setFeedback({ type: 'success', message: 'Upload concluído.' });
      onUploaded?.(uploadedDocument);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="upload-form" ref={formRef} onSubmit={handleSubmit}>
      <label className="file-picker" htmlFor="document-file">
        <span className="file-symbol" aria-hidden="true">+</span>
        <span className="file-picker-copy">
          <strong>{file ? file.name : 'Escolher arquivo'}</strong>
          <small>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Selecione um arquivo do seu dispositivo'}</small>
        </span>
      </label>
      <input
        className="visually-hidden"
        id="document-file"
        type="file"
        onChange={(event) => {
          setFile(event.target.files?.[0] || null);
          setFeedback(null);
        }}
      />
      <p className="upload-note">
        {ownerId ? `O documento será associado a ${ownerId}.` : 'Abra uma biblioteca antes de enviar.'}
      </p>
      <button className="button button-primary upload-submit" type="submit" disabled={!file || !ownerId || submitting}>
        {submitting ? 'Enviando...' : 'Enviar documento'}
      </button>
      {feedback && (
        <p className={`feedback feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          {feedback.message}
        </p>
      )}
    </form>
  );
}