import { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiTrash2, FiMail, FiUserCheck, FiUserX } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import Pagination from '../../components/common/Pagination';

const NewsletterPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/newsletter', { params: { search: search || undefined, page, limit: 20 } })
      .then(({ data }) => {
        setSubscribers(data.data.subscribers);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    await adminAxios.delete(`/newsletter/${id}`);
    fetchSubscribers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl text-ink">Newsletter</h1>
        <button
          type="button"
          onClick={() => window.open(`${adminAxios.defaults.baseURL}/newsletter/export`, '_blank')}
          className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink"
        >
          <FiDownload size={14} /> EXPORT
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={FiMail} label="Total Subscribers" value={stats.total ?? 0} tone="ink" />
        <StatCard icon={FiUserCheck} label="Active" value={stats.active ?? 0} tone="brand" />
        <StatCard icon={FiUserX} label="Unsubscribed" value={stats.unsubscribed ?? 0} tone="gold" />
      </div>

      <div className="bg-white border border-cream-200">
        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by email..."
            className="w-full sm:max-w-xs px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subscribers.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No subscribers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs tracking-widest text-muted">
                  <th className="p-4 font-normal">Email</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal">Subscribed On</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id} className="border-b border-cream-100 last:border-0">
                    <td className="p-4 text-ink">{s.email}</td>
                    <td className="p-4">
                      <span className={`text-[10px] tracking-wide px-2 py-1 ${s.isActive ? 'bg-brand/10 text-brand' : 'bg-cream-200 text-muted'}`}>
                        {s.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="p-4 text-muted whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button type="button" onClick={() => handleRemove(s._id)} className="text-muted hover:text-charcoal" title="Remove">
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default NewsletterPage;
