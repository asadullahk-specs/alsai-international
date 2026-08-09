import { useState, useEffect, useCallback } from 'react';
import { FiDownload } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';

const ActivityLogsPage = ({ embedded = false }) => {
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('activity-logs', { params: { module: moduleFilter, page, limit: 20 } })
      .then(({ data }) => {
        setLogs(data.data.logs);
        setModules(data.data.modules);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [moduleFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <div className={`flex items-center justify-between max-480:flex-col max-480:items-stretch gap-3 flex-wrap ${embedded ? 'mb-4' : 'mb-6'}`}>
        {!embedded && <h1 className="font-serif text-2xl text-ink">Activity Logs</h1>}
        {embedded && <div />}
        <button
          type="button"
          onClick={() => window.open(`${adminAxios.defaults.baseURL}/activity-logs/export`, '_blank')}
          className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink max-480:justify-center"
        >
          <FiDownload size={14} /> EXPORT LOGS
        </button>
      </div>

      <div className="bg-white border border-cream-200">
        <div className="p-4 border-b border-cream-200 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setModuleFilter('all'); setPage(1); }}
            className={`px-3 py-1.5 text-xs tracking-wide whitespace-nowrap ${moduleFilter === 'all' ? 'bg-brand text-white' : 'border border-cream-200 text-muted'}`}
          >
            All Actions
          </button>
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setModuleFilter(m); setPage(1); }}
              className={`px-3 py-1.5 text-xs tracking-wide capitalize whitespace-nowrap ${moduleFilter === m ? 'bg-brand text-white' : 'border border-cream-200 text-muted'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No activity yet.</p>
        ) : (
          <StackTable
            breakpoint={640}
            rows={logs}
            rowKey={(l) => l._id}
            columns={[
              { key: 'date', label: 'Date & Time', render: (l) => <span className="whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</span> },
              { key: 'admin', label: 'Admin', render: (l) => <span className="whitespace-nowrap">{l.admin?.fullName || 'System'}</span> },
              { key: 'action', label: 'Action', render: (l) => l.action },
              { key: 'module', label: 'Module', render: (l) => <span className="capitalize">{l.module}</span> },
            ]}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default ActivityLogsPage;
