import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/documentApi.js';
import './App.css';

export default function App() {
  const [ownerDraft, setOwnerDraft] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!ownerId) {
      setDocuments([]);
      setListError('');
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setListError('');

    listDocuments(ownerId)
      .then((result) => {
        if (active) setDocuments(result);
      })
      .catch((error) => {
        if (active) setListError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ownerId, refreshKey]);

  function refreshDocuments() {
    setRefreshKey((current) => current + 1);
  }

  function applyOwner(event) {
    event.preventDefault();
    const nextOwnerId = ownerDraft.trim();
    setOwnerId(nextOwnerId);
    setNotice('');
    refreshDocuments();
  }

  function handleUploaded(document) {
    setNotice(`${document.originalName} foi enviado.`);
    refreshDocuments();
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand-line">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>ARQUIVO LOCAL</span>
        </div>
        <div className="header-content">
          <div>
            <p className="eyebrow">DOCUMENT MANAGEMENT SYSTEM</p>
            <h1>Documentos</h1>
            <p className="intro">Envie, organize e recupere seus arquivos em um só lugar.</p>
          </div>
          <form className="owner-form" onSubmit={applyOwner}>
            <label htmlFor="owner-id">Identificador do usuário</label>
            <div className="owner-controls">
              <input
                id="owner-id"
                autoComplete="off"
                value={ownerDraft}
                onChange={(event) => setOwnerDraft(event.target.value)}
                placeholder="Ex.: equipe-financeiro"
                required
              />
              <button className="button button-dark" type="submit">Abrir arquivos</button>
            </div>
          </form>
        </div>
      </header>

      {notice && <p className="notice" role="status">{notice}</p>}

      <div className="workspace-grid">
        <section className="upload-panel" aria-labelledby="upload-heading">
          <div className="section-heading">
            <span className="section-index">01</span>
            <div>
              <p className="eyebrow">NOVO ARQUIVO</p>
              <h2 id="upload-heading">Adicionar documento</h2>
            </div>
          </div>
          <UploadComponent ownerId={ownerId} onUploaded={handleUploaded} />
        </section>

        <section className="documents-panel" aria-labelledby="documents-heading">
          <div className="list-heading">
            <div className="section-heading">
              <span className="section-index">02</span>
              <div>
                <p className="eyebrow">BIBLIOTECA</p>
                <h2 id="documents-heading">Seus documentos</h2>
              </div>
            </div>
            <span className="document-count">
              {loading ? '...' : String(documents.length).padStart(2, '0')}
            </span>
          </div>
          {!ownerId ? (
            <p className="list-prompt">Informe um identificador para abrir a biblioteca.</p>
          ) : (
            <DocumentList documents={documents} loading={loading} error={listError} />
          )}
        </section>
      </div>

      <footer className="page-footer">
        <span>ARMAZENAMENTO LOCAL</span>
        <span>{ownerId ? `BIBLIOTECA · ${ownerId}` : 'NENHUMA BIBLIOTECA ABERTA'}</span>
      </footer>
    </main>
  );
}