import { useState, useRef } from 'react';
import { FiDownload, FiUpload, FiAlertTriangle } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';

const BackupRestorePage = () => {
  const [restoring, setRestoring] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    const { data } = await adminAxios.get('backup/export');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alsai-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Restoring will overwrite matching store content records. Continue?')) {
      e.target.value = '';
      return;
    }

    setError('');
    setResult(null);
    setRestoring(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const { data } = await adminAxios.post('backup/import', payload);
      setResult(data.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Restore failed - check the file is a valid AL SA\'I backup export.');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-1">Backup &amp; Restore</h1>
      <p className="text-sm text-muted mb-6">Export or restore your store's content configuration.</p>

      <div className="bg-gold/10 border border-gold/30 p-4 mb-6 flex gap-3">
        <FiAlertTriangle className="text-gold flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-muted">
          Backups cover store content only - catalog, homepage, website content, marketing, and settings. Orders, customers,
          reviews, and admin accounts are excluded and require database-level backup tooling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-cream-200 p-6">
          <FiDownload className="text-brand mb-3" size={22} />
          <h2 className="font-serif text-lg text-ink mb-2">Export Backup</h2>
          <p className="text-sm text-muted mb-4">Download a full JSON snapshot of your store's content.</p>
          <button type="button" onClick={handleExport} className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5">
            DOWNLOAD BACKUP
          </button>
        </div>

        <div className="bg-white border border-cream-200 p-6">
          <FiUpload className="text-brand mb-3" size={22} />
          <h2 className="font-serif text-lg text-ink mb-2">Restore Backup</h2>
          <p className="text-sm text-muted mb-4">Upload a previously exported backup file to restore content.</p>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={restoring}
            className="border border-ink/20 text-ink text-xs tracking-widest px-5 py-2.5 hover:border-ink disabled:opacity-60"
          >
            {restoring ? 'RESTORING...' : 'UPLOAD & RESTORE'}
          </button>
          {error && <p className="text-xs text-charcoal mt-3">{error}</p>}
          {result && (
            <div className="mt-4 text-xs text-muted space-y-0.5">
              <p className="text-brand">Restore complete:</p>
              {Object.entries(result).map(([key, count]) => (
                <p key={key}>{key}: {count} record(s)</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage;
