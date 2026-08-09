import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../../utils/formatPrice';

const CustomerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(() => {
    adminAxios.get(`/customers/${id}`).then(({ data: res }) => {
      setData(res.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleStatusToggle = async () => {
    const nextStatus = data.customer.status === 'active' ? 'inactive' : 'active';
    await adminAxios.put(`/customers/${id}/status`, { status: nextStatus });
    fetchCustomer();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-sm text-muted">Customer not found.</p>;

  const { customer, orders, addresses, totalOrders, totalSpent, wishlistCount } = data;

  return (
    <div>
      <Link to="/admin/customers" className="text-xs text-muted hover:text-brand flex items-center gap-1 mb-4">
        <FiArrowLeft size={12} /> Back to Customers
      </Link>

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">{customer.fullName}</h1>
          <p className="text-sm text-muted">{customer.email} · {customer.phone}</p>
        </div>
        <button
          type="button"
          onClick={handleStatusToggle}
          className="border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink"
        >
          MARK AS {customer.status === 'active' ? 'INACTIVE' : 'ACTIVE'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FiShoppingBag} label="Total Orders" value={totalOrders} tone="ink" />
        <StatCard icon={FiDollarSign} label="Total Spent" value={formatPrice(totalSpent)} tone="brand" />
        <StatCard icon={FiHeart} label="Wishlist Items" value={wishlistCount} tone="gold" />
        <StatCard label="Status" value={<StatusBadge status={customer.status} />} tone="ink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-4">RECENT ORDERS</p>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/admin/orders/${o._id}`}
                  className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50"
                >
                  <div>
                    <p className="text-sm text-ink">#{o.orderNumber}</p>
                    <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={o.orderStatus} />
                  <span className="text-sm text-ink">{formatPrice(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-cream-200 p-5">
          <p className="text-xs tracking-widest text-muted mb-4">SAVED ADDRESSES</p>
          {addresses.length === 0 ? (
            <p className="text-sm text-muted">No addresses saved.</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((a) => (
                <div key={a._id} className="text-sm">
                  <p className="text-ink">{a.fullName} {a.isDefault && <span className="text-xs text-brand">(Default)</span>}</p>
                  <p className="text-xs text-muted">{a.addressLine}, {a.city}, {a.province}</p>
                  <p className="text-xs text-muted">{a.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
