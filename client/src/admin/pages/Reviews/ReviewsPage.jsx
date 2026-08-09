import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiTrash2, FiStar } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';

const TABS = [
  { key: 'all', label: 'All Reviews' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({});
  const [averageRating, setAverageRating] = useState(0);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/reviews', { params: { status, page, limit: 10 } })
      .then(({ data }) => {
        setReviews(data.data.reviews);
        setCounts(data.data.counts);
        setAverageRating(data.data.averageRating);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateStatus = async (id, newStatus) => {
    await adminAxios.put(`/reviews/${id}/status`, { status: newStatus });
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    await adminAxios.delete(`/reviews/${id}`);
    fetchReviews();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-6">Reviews</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Reviews" value={counts.total ?? 0} tone="ink" />
        <StatCard label="Pending Reviews" value={counts.pending ?? 0} tone="gold" />
        <StatCard label="Approved Reviews" value={counts.approved ?? 0} tone="brand" />
        <StatCard label="Rejected Reviews" value={counts.rejected ?? 0} tone="ink" />
        <StatCard icon={FiStar} label="Average Rating" value={averageRating} tone="gold" />
      </div>

      <div className="bg-white border border-cream-200">
        <FilterTabs breakpoint={820} tabs={TABS} active={status} onChange={(key) => { setStatus(key); setPage(1); }} />

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No reviews found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={reviews}
            rowKey={(r) => r._id}
            columns={[
              { key: 'customer', label: 'Customer', render: (r) => <span className="whitespace-nowrap">{r.customer?.fullName}</span> },
              { key: 'product', label: 'Product', render: (r) => <span className="whitespace-nowrap text-muted">{r.product?.name}</span> },
              { key: 'rating', label: 'Rating', render: (r) => <span className="text-gold whitespace-nowrap">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span> },
              {
                key: 'image',
                label: 'Image',
                render: (r) =>
                  r.image ? (
                    <img
                      src={r.image.startsWith('http') ? r.image : `${adminAxios.defaults.baseURL.replace('/api/admin', '')}${r.image}`}
                      alt=""
                      className="w-10 h-10 object-cover inline-block"
                    />
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  ),
              },
              { key: 'message', label: 'Message', render: (r) => <span className="max-w-xs inline-block">{r.reviewText}</span> },
              { key: 'date', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            actions={(r) => (
              <>
                {r.status !== 'approved' && (
                  <button type="button" onClick={() => updateStatus(r._id, 'approved')} className="hover:text-brand" title="Approve">
                    <FiCheck size={15} />
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button type="button" onClick={() => updateStatus(r._id, 'rejected')} className="hover:text-charcoal" title="Reject">
                    <FiX size={15} />
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(r._id)} className="hover:text-charcoal" title="Delete">
                  <FiTrash2 size={15} />
                </button>
              </>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default ReviewsPage;
