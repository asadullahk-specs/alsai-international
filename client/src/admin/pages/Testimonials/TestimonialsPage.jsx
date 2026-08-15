import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { driveImg } from '../../../utils/driveImg';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/testimonials', { params: { status } })
      .then(({ data }) => {
        setTestimonials(data.data.testimonials);
        setCounts(data.data.counts);
      })
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const updateStatus = async (id, newStatus) => {
    await adminAxios.put(`/testimonials/${id}/status`, { status: newStatus });
    fetchTestimonials();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial permanently?')) return;
    await adminAxios.delete(`/testimonials/${id}`);
    fetchTestimonials();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-ink">Testimonials</h1>
        <p className="text-sm text-muted mt-1">
          Submitted by customers on the homepage. Approve the ones you want to feature - nothing here is written by admins.
        </p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={counts.all ?? 0} tone="ink" />
        <StatCard label="Pending" value={counts.pending ?? 0} tone="gold" />
        <StatCard label="Approved" value={counts.approved ?? 0} tone="brand" />
        <StatCard label="Rejected" value={counts.rejected ?? 0} tone="charcoal" />
      </div>

      <div className="bg-white border border-cream-200">
        <FilterTabs breakpoint={640} tabs={TABS} active={status} onChange={setStatus} />

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No testimonials found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={testimonials}
            rowKey={(t) => t._id}
            columns={[
              { key: 'customer', label: 'Customer', render: (t) => <span className="whitespace-nowrap">{t.customerName}</span> },
              { key: 'rating', label: 'Rating', render: (t) => <span className="text-gold whitespace-nowrap">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span> },
              {
                key: 'image',
                label: 'Image',
                render: (t) => (t.reviewImage ? <img src={driveImg(t.reviewImage)} alt="" className="w-10 h-10 object-cover inline-block" /> : <span className="text-muted text-xs">—</span>),
              },
              { key: 'message', label: 'Message', render: (t) => <span className="max-w-xs inline-block">{t.message}</span> },
              { key: 'date', label: 'Date', render: (t) => new Date(t.createdAt).toLocaleDateString() },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
            ]}
            actions={(t) => (
              <>
                {t.status !== 'approved' && (
                  <button type="button" onClick={() => updateStatus(t._id, 'approved')} className="hover:text-brand" title="Approve">
                    <FiCheck size={15} />
                  </button>
                )}
                {t.status !== 'rejected' && (
                  <button type="button" onClick={() => updateStatus(t._id, 'rejected')} className="hover:text-charcoal" title="Reject">
                    <FiX size={15} />
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(t._id)} className="hover:text-charcoal" title="Delete">
                  <FiTrash2 size={15} />
                </button>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default TestimonialsPage;