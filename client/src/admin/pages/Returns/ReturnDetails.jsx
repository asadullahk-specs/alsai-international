import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../../utils/formatPrice';
import { driveImg } from '../../../utils/driveImg';

const statusKey = (s) => s.toLowerCase().replace(/ /g, '_');

const ReturnDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const fetchReturn = useCallback(() => {
    adminAxios.get(`/returns/${id}`).then(({ data: res }) => {
      setData(res.data.returnRequest);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchReturn();
  }, [fetchReturn]);

  const runAction = async (path, body = {}, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActing(true);
    try {
      await adminAxios.put(`/returns/${id}/${path}`, body);
      fetchReturn();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to complete this action.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />;
  if (!data) return <p className="text-sm text-muted">Return not found.</p>;

  const { status } = data;

  return (
    <div>
      <Link to="/admin/returns" className="text-xs text-muted hover:text-brand flex items-center gap-1 mb-4">
        <FiArrowLeft size={12} /> Back to Returns &amp; Refunds
      </Link>

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">{data.returnId}</h1>
          <p className="text-sm text-muted">Order #{data.orderNumber} · {data.customer?.fullName}</p>
        </div>
        <StatusBadge status={statusKey(status)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-cream-200 rounded-md p-5 space-y-3 text-sm">
            <p className="text-xs tracking-widest text-muted mb-1">RETURN DETAILS</p>
            <div className="flex justify-between"><span className="text-muted">Customer</span><span className="text-ink">{data.customer?.fullName} ({data.customer?.email})</span></div>
            <div className="flex justify-between"><span className="text-muted">Original Order</span><span className="text-ink">#{data.orderNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted">Product</span><span className="text-ink">{data.productName}</span></div>
            <div className="flex justify-between"><span className="text-muted">Variant/Size</span><span className="text-ink">{data.size}</span></div>
            <div className="flex justify-between"><span className="text-muted">Quantity</span><span className="text-ink">{data.quantity}</span></div>
            <div className="flex justify-between"><span className="text-muted">Reason</span><span className="text-ink text-right max-w-[60%]">{data.reason}</span></div>
            {data.customerNotes && <div className="flex justify-between"><span className="text-muted">Customer Notes</span><span className="text-ink text-right max-w-[60%]">{data.customerNotes}</span></div>}
            <div className="flex justify-between"><span className="text-muted">Request Date</span><span className="text-ink">{new Date(data.requestedDate).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted">Refund Amount</span><span className="text-ink">{formatPrice(data.refundAmount)}</span></div>
          </div>

          {data.images?.length > 0 && (
            <div className="bg-white border border-cream-200 rounded-md p-5">
              <p className="text-xs tracking-widest text-muted mb-3">IMAGES / PROOF</p>
              <div className="grid grid-cols-3 gap-3">
                {data.images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-square bg-cream-100 rounded-md overflow-hidden">
                    <img src={driveImg(img)} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {data.statusTimeline?.length > 0 && (
            <div className="bg-white border border-cream-200 rounded-md p-5">
              <p className="text-xs tracking-widest text-muted mb-4">STATUS HISTORY</p>
              <div className="space-y-3">
                {data.statusTimeline.slice().reverse().map((t, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-ink">{t.status}</p>
                    <p className="text-xs text-muted">{t.note} · {new Date(t.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-cream-200 rounded-md p-5 space-y-2 h-fit">
          <p className="text-xs tracking-widest text-muted mb-2">ACTIONS</p>

          {status === 'Requested' && (
            <>
              <ActionButton disabled={acting} onClick={() => runAction('approve')}>Approve</ActionButton>
              <ActionButton disabled={acting} onClick={() => runAction('reject')}>Reject</ActionButton>
              <ActionButton disabled={acting} onClick={() => runAction('request-info')}>Request Information</ActionButton>
            </>
          )}
          {status === 'Under Review' && (
            <>
              <ActionButton disabled={acting} onClick={() => runAction('approve')}>Approve</ActionButton>
              <ActionButton disabled={acting} onClick={() => runAction('reject')}>Reject</ActionButton>
            </>
          )}
          {status === 'Approved' && (
            <ActionButton disabled={acting} onClick={() => runAction('received', { condition: window.prompt("Item condition: type 'sellable' or 'damaged'", 'sellable') })}>
              Mark Received
            </ActionButton>
          )}
          {status === 'Return In Transit' && (
            <ActionButton disabled={acting} onClick={() => runAction('received', { condition: window.prompt("Item condition: type 'sellable' or 'damaged'", 'sellable') })}>
              Mark Received
            </ActionButton>
          )}
          {status === 'Received' && (
            <>
              <ActionButton disabled={acting} onClick={() => runAction('approve-refund', { refundAmount: data.refundAmount })}>Approve Refund</ActionButton>
              <ActionButton disabled={acting} onClick={() => runAction('exchange')}>Mark Exchange Completed</ActionButton>
            </>
          )}
          {status === 'Refund Pending' && (
            <ActionButton disabled={acting} onClick={() => runAction('process-refund', {}, `Process a refund of ${formatPrice(data.refundAmount)}? This creates a payment record.`)}>
              Process Refund
            </ActionButton>
          )}
          {['Refunded', 'Exchange Completed', 'Rejected'].includes(status) && (
            <ActionButton disabled={acting} onClick={() => runAction('close')}>Close Return</ActionButton>
          )}
          {status === 'Closed' && <p className="text-sm text-muted">This return is closed.</p>}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className="w-full text-left text-sm px-3 py-2.5 rounded-md border border-cream-200 hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
  >
    {children}
  </button>
);

export default ReturnDetails;
