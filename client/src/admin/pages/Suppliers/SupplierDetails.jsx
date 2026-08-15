import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../../utils/formatPrice';

const SupplierDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSupplier = useCallback(() => {
    adminAxios.get(`/suppliers/${id}`).then(({ data: res }) => {
      setData(res.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-sm text-muted">Supplier not found.</p>;

  const { supplier, purchases, payments, productsSupplied, totalPurchases, totalPaid, outstandingBalance } = data;

  return (
    <div>
      <Link to="/admin/suppliers" className="text-xs text-muted hover:text-brand flex items-center gap-1 mb-4">
        <FiArrowLeft size={12} /> Back to Suppliers
      </Link>

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">{supplier.name}</h1>
          <p className="text-sm text-muted">{supplier.company || 'No company on file'} · {supplier.email || '—'} · {supplier.phone || '—'}</p>
        </div>
        <StatusBadge status={supplier.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={FiShoppingCart} label="Total Purchases" value={formatPrice(totalPurchases)} tone="ink" />
        <StatCard icon={FiDollarSign} label="Total Paid" value={formatPrice(totalPaid)} tone="brand" />
        <StatCard icon={FiTrendingUp} label="Outstanding Balance" value={formatPrice(outstandingBalance)} tone="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-white border border-cream-200 rounded-md p-5">
          <p className="text-xs tracking-widest text-muted mb-4">PURCHASE HISTORY</p>
          {purchases.length === 0 ? (
            <p className="text-sm text-muted">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <Link
                  key={p._id}
                  to={`/admin/purchases/${p._id}`}
                  className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 rounded-md px-2"
                >
                  <div>
                    <p className="text-sm text-ink">{p.purchaseId}</p>
                    <p className="text-xs text-muted">{new Date(p.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={p.purchaseStatus.toLowerCase().replace(/ /g, '_')} />
                  <span className="text-sm text-ink">{formatPrice(p.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-cream-200 rounded-md p-5">
          <p className="text-xs tracking-widest text-muted mb-4">PRODUCTS SUPPLIED</p>
          {productsSupplied.length === 0 ? (
            <p className="text-sm text-muted">No products recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {productsSupplied.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="text-ink truncate">{p.productName}</span>
                  <span className="text-muted flex-shrink-0">{p.unitsSupplied} units</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-cream-200 rounded-md p-5">
        <p className="text-xs tracking-widest text-muted mb-4">PAYMENT HISTORY</p>
        {payments.length === 0 ? (
          <p className="text-sm text-muted">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                <div>
                  <p className="text-sm text-ink">{p.paymentId}</p>
                  <p className="text-xs text-muted">{new Date(p.date).toLocaleDateString()} · {p.method}</p>
                </div>
                <StatusBadge status={p.status.toLowerCase().replace(/ /g, '_')} />
                <span className="text-sm text-ink">{formatPrice(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {supplier.notes && (
        <div className="bg-white border border-cream-200 rounded-md p-5 mt-5">
          <p className="text-xs tracking-widest text-muted mb-2">NOTES</p>
          <p className="text-sm text-ink">{supplier.notes}</p>
        </div>
      )}
    </div>
  );
};

export default SupplierDetails;
