import { useState, useEffect, useCallback } from 'react';
import { FiMail, FiTrash2, FiArchive, FiEye } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import Pagination from '../../components/common/Pagination';
import FilterTabs from '../../components/common/FilterTabs';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'archived', label: 'Archived' },
];

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchMessages = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/messages', { params: { status, page, limit: 15 } })
      .then(({ data }) => {
        setMessages(data.data.messages);
        setUnreadCount(data.data.unreadCount);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleExpand = async (message) => {
    setExpanded(expanded === message._id ? null : message._id);
    if (message.status === 'unread') {
      await adminAxios.put(`/messages/${message._id}/status`, { status: 'read' });
      fetchMessages();
    }
  };

  const handleArchive = async (id) => {
    await adminAxios.put(`/messages/${id}/status`, { status: 'archived' });
    fetchMessages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    await adminAxios.delete(`/messages/${id}`);
    fetchMessages();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Messages</h1>

      <div className="mb-6 max-w-xs">
        <StatCard icon={FiMail} label="Unread Messages" value={unreadCount} tone="brand" />
      </div>

      <div className="bg-white border border-cream-200">
        <FilterTabs breakpoint={820} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No messages found.</p>
        ) : (
          <div className="divide-y divide-cream-100">
            {messages.map((m) => (
              <div key={m._id} className="p-4">
                <button type="button" onClick={() => handleExpand(m)} className="w-full flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0 flex items-center gap-2">
                    {m.status === 'unread' && <span className="w-2 h-2 bg-brand rounded-full flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${m.status === 'unread' ? 'text-ink font-medium' : 'text-muted'}`}>{m.name} · {m.email}</p>
                      <p className="text-xs text-muted truncate">{m.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>
                </button>

                {expanded === m._id && (
                  <div className="mt-3 pl-4 border-l-2 border-cream-200">
                    <p className="text-sm text-ink whitespace-pre-wrap">{m.message}</p>
                    <p className="text-xs text-muted mt-2">Phone: {m.phone || 'Not provided'}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <a href={`mailto:${m.email}`} className="text-xs text-brand hover:underline flex items-center gap-1">
                        <FiEye size={12} /> Reply by Email
                      </a>
                      {m.status !== 'archived' && (
                        <button type="button" onClick={() => handleArchive(m._id)} className="text-xs text-muted hover:text-ink flex items-center gap-1">
                          <FiArchive size={12} /> Archive
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(m._id)} className="text-xs text-muted hover:text-charcoal flex items-center gap-1">
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default MessagesPage;
