import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../../utils/formatPrice';

const STATUSES = ['Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Partially Paid', 'Paid'];
const statusKey = (s) => s.toLowerCase().replace(/ /g, '_');

const PurchaseDetails = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchPurchase = useCallback(() => {
    adminAxios.get(`/purchases/${id}`).then(({ data }) => {
      setPurchase(data.data.purchase);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchPurchase();
  }, [fetchPurchase]);

  const updateStatus = async (purchaseStatus) => {
    if (purchaseStatus === 'Received' && !window.confirm('Mark as Received? This will increase stock for every item in this purchase.')) return;
    setUpdating(true);
    try {
      await adminAxios.put(`/purchases/${id}/status`, { purchaseStatus });
      fetchPurchase();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (paymentStatus) => {
    setUpdating(true);
    try {
      await adminAxios.put(`/purchases/${id}/payment`, { paymentStatus });
      fetchPurchase();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Unable to update payment status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />;
  if (!purchase) return <p className="text-sm text-muted">Purchase not found.</p>;

  const nextStatuses = STATUSES.filter((s) => s !== purchase.purchaseStatus);

  return (
    <div>
      <Link to="/admin/purchases" className="text-xs text-muted hover:text-brand flex items-center gap-1 mb-4">
        <FiArrowLeft size={12} /> Back to Purchases
      </Link>

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">{purchase.purchaseId}</h1>
          <p className="text-sm text-muted">{purchase.supplier?.name} · {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={statusKey(purchase.purchaseStatus)} />
          <StatusBadge status={statusKey(purchase.paymentStatus)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-cream-200 rounded-md p-5">
            <p className="text-xs tracking-widest text-muted mb-4">ITEMS</p>
            <div className="space-y-3">
              {purchase.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0 text-sm">
                  <div>
                    <p className="text-ink">{it.productName}</p>
                    <p className="text-xs text-muted">{it.size} · Qty {it.quantity} · Unit cost {formatPrice(it.unitCost)}</p>
                  </div>
                  <span className="text-ink">{formatPrice(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t border-cream-200 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="text-ink">{formatPrice(purchase.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-ink">-{formatPrice(purchase.discountTotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tax</span><span className="text-ink">+{formatPrice(purchase.taxTotal)}</span></div>
              <div className="flex justify-between text-base font-serif pt-1"><span className="text-ink">Total</span><span className="text-brand">{formatPrice(purchase.total)}</span></div>
            </div>
          </div>

          {purchase.statusTimeline?.length > 0 && (
            <div className="bg-white border border-cream-200 rounded-md p-5">
              <p className="text-xs tracking-widest text-muted mb-4">STATUS HISTORY</p>
              <div className="space-y-3">
                {purchase.statusTimeline.slice().reverse().map((t, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-ink">{t.status}</p>
                    <p className="text-xs text-muted">{t.note} · {new Date(t.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {purchase.notes && (
            <div className="bg-white border border-cream-200 rounded-md p-5">
              <p className="text-xs tracking-widest text-muted mb-2">NOTES</p>
              <p className="text-sm text-ink">{purchase.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {purchase.purchaseStatus !== 'Cancelled' && (
            <div className="bg-white border border-cream-200 rounded-md p-5">
              <p className="text-xs tracking-widest text-muted mb-3">UPDATE STATUS</p>
              <div className="space-y-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={updating}
                    onClick={() => updateStatus(s)}
                    className="w-full flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-md border border-cream-200 hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
                  >
                    {s === 'Received' && <FiCheckCircle size={14} />} Mark as {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {purchase.paymentStatus !== 'Paid' && (
            <div className="bg-white border border-cream-200 rounded-md p-5">
              <p className="text-xs tracking-widest text-muted mb-3">UPDATE PAYMENT</p>
              <div className="space-y-2">
                {PAYMENT_STATUSES.filter((s) => s !== purchase.paymentStatus).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={updating}
                    onClick={() => updatePaymentStatus(s)}
                    className="w-full flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-md border border-cream-200 hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
                  >
                    {s === 'Paid' && <FiCheckCircle size={14} />} Mark as {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-cream-200 rounded-md p-5 space-y-2 text-sm">
            <p className="text-xs tracking-widest text-muted mb-1">DETAILS</p>
            <div className="flex justify-between"><span className="text-muted">Supplier Reference</span><span className="text-ink">{purchase.supplierReference || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Amount Paid</span><span className="text-ink">{formatPrice(purchase.amountPaid)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Created By</span><span className="text-ink">{purchase.createdByName || '—'}</span></div>
            {purchase.attachment && (
              <a href={purchase.attachment} target="_blank" rel="noreferrer" className="text-brand hover:underline block pt-1">
                View Attachment
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetails;
