import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiEye, FiUsers, FiUserCheck, FiUserX, FiShoppingBag } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import StackTable from '../../components/common/StackTable';
import { formatPrice } from '../../../utils/formatPrice';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    adminAxios
      .get('/customers', { params: { search: search || undefined, page, limit: 10 } })
      .then(({ data }) => {
        setCustomers(data.data.customers);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleStatusToggle = async (customer) => {
    const nextStatus = customer.status === 'active' ? 'inactive' : 'active';
    await adminAxios.put(`/customers/${customer._id}/status`, { status: nextStatus });
    fetchCustomers();
  };

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <h1 className="font-serif text-2xl text-ink">Customers</h1>
        <button
          type="button"
          onClick={() => window.open(`${adminAxios.defaults.baseURL}/customers/export`, '_blank')}
          className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink max-480:w-full max-480:justify-center"
        >
          <FiDownload size={14} /> EXPORT
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard icon={FiUsers} label="Total Customers" value={stats.total ?? 0} tone="ink" />
        <StatCard icon={FiUserCheck} label="Active" value={stats.active ?? 0} tone="brand" />
        <StatCard icon={FiUserX} label="Inactive" value={stats.inactive ?? 0} tone="gold" />
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats.totalOrders ?? 0} tone="ink" />
        <StatCard label="Total Spent" value={formatPrice(stats.totalSpent)} tone="brand" />
      </div>

      <div className="bg-white border border-cream-200">
        <div className="p-4 border-b border-cream-200">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full sm:max-w-xs px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <p className="text-sm text-muted py-14 text-center">No customers found.</p>
        ) : (
          <StackTable
            breakpoint={1180}
            rows={customers}
            rowKey={(c) => c._id}
            columns={[
              { key: 'name', label: 'Name', render: (c) => <span className="text-ink whitespace-nowrap">{c.fullName}</span> },
              { key: 'phone', label: 'Phone', render: (c) => c.phone },
              { key: 'email', label: 'Email', render: (c) => c.email },
              { key: 'registered', label: 'Registered', render: (c) => new Date(c.createdAt).toLocaleDateString() },
              { key: 'orders', label: 'Orders', render: (c) => c.totalOrders },
              { key: 'spent', label: 'Total Spent', render: (c) => formatPrice(c.totalSpent) },
              {
                key: 'status',
                label: 'Status',
                render: (c) => (
                  <button type="button" onClick={() => handleStatusToggle(c)}>
                    <StatusBadge status={c.status} />
                  </button>
                ),
              },
            ]}
            actions={(c) => (
              <Link to={`/admin/customers/${c._id}`} className="text-muted hover:text-brand inline-flex" title="View">
                <FiEye size={15} />
              </Link>
            )}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
};

export default CustomersList;
