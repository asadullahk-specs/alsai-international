import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiPackage, FiUsers, FiBox, FiAlertTriangle, FiStar, FiMail } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import adminAxios from '../../../api/adminAxios';
import { formatPrice } from '../../../utils/formatPrice';

const STATUS_COLORS = {
  pending: '#D9BE8B',
  confirmed: '#C9A15A',
  processing: '#C17F3E',
  packed: '#A9662A',
  shipped: '#8A5220',
  delivered: '#211D1A',
  cancelled: '#141210',
};

const TONE_STYLES = {
  brand: 'bg-brand/10 text-brand',
  amber: 'bg-gold/15 text-gold',
  green: 'bg-brand/10 text-brand',
  blue: 'bg-ink/10 text-ink',
  red: 'bg-charcoal/10 text-charcoal',
};

const StatCard = ({ icon: Icon, label, value, tone = 'brand' }) => (
  <div className="bg-white border border-cream-200 rounded-md p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${TONE_STYLES[tone]}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-serif text-ink truncate">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAxios
      .get('dashboard')
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const orderStatusData = stats.ordersByStatus.map((s) => ({ name: s._id, value: s.count }));

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-6">Here's what's happening with your store today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiDollarSign} label="Total Revenue" value={formatPrice(stats.totalRevenue)} tone="brand" />
        <StatCard icon={FiPackage} label="Total Orders" value={stats.totalOrders} tone="amber" />
        <StatCard icon={FiUsers} label="Total Customers" value={stats.totalCustomers} tone="green" />
        <StatCard icon={FiBox} label="Total Products" value={stats.totalProducts} tone="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white border border-cream-200 rounded-md p-5">
          <h2 className="text-sm text-ink font-medium mb-4">Sales Overview (Last 6 Months)</h2>
          {stats.salesByMonth.length === 0 ? (
            <p className="text-sm text-muted py-16 text-center">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D8" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#7A7168" />
                <YAxis tick={{ fontSize: 11 }} stroke="#7A7168" />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Line type="monotone" dataKey="total" stroke="#A9662A" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-cream-200 rounded-md p-5">
          <h2 className="text-sm text-ink font-medium mb-4">Orders by Status</h2>
          {orderStatusData.length === 0 ? (
            <p className="text-sm text-muted py-16 text-center">No orders yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65}>
                    {orderStatusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#7A7168'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {orderStatusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted capitalize">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] || '#7A7168' }}
                    />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiStar} label="Pending Reviews" value={stats.pendingReviews} tone="amber" />
        <StatCard icon={FiMail} label="Unread Messages" value={stats.pendingMessages} tone="blue" />
        <StatCard icon={FiAlertTriangle} label="Out of Stock Products" value={stats.outOfStockCount} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-cream-200 rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-ink font-medium">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-brand hover:underline">
              View all →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-1">
              {stats.recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between text-sm py-2 border-b border-cream-100 last:border-0">
                  <div>
                    <p className="text-ink">#{o.orderNumber}</p>
                    <p className="text-xs text-muted">{o.customer?.fullName || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-ink">{formatPrice(o.total)}</p>
                    <p className="text-xs text-muted capitalize">{o.orderStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-cream-200 rounded-md p-5">
          <h2 className="text-sm text-ink font-medium mb-4">Low Stock Alerts</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">Everything is well stocked.</p>
          ) : (
            <div className="space-y-1">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm py-2 border-b border-cream-100 last:border-0">
                  <span className="text-ink">{p.name}</span>
                  <span className="text-gold text-xs">{p.totalStock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-cream-200 rounded-md p-5">
        <h2 className="text-sm text-ink font-medium mb-4">Recent Customers</h2>
        {stats.recentCustomers.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No customers yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.recentCustomers.map((c) => (
              <div key={c._id} className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-xs text-muted flex-shrink-0">
                  {c.fullName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{c.fullName}</p>
                  <p className="text-xs text-muted truncate">{c.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
