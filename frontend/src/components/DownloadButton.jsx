import { useState } from 'react';
import { downloadDocument } from '../services/documentApi.js';

export default function DownloadButton({ document }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setDownloading(true);
    setError('');

    try {
      await downloadDocument(document);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <span className="download-control">
      <button className="button button-download" type="button" onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Baixando...' : 'Baixar arquivo'}
      </button>
      {error && <span className="download-error" role="alert">{error}</span>}
    </span>
  );
}