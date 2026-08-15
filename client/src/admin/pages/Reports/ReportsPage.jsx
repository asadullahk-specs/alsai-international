import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDownload } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import StatCard from '../../components/common/StatCard';
import StackTable from '../../components/common/StackTable';
import FilterTabs from '../../components/common/FilterTabs';
import { formatPrice } from '../../../utils/formatPrice';

const TABS = [
  { key: 'Sales', label: 'SALES' },
  { key: 'Orders', label: 'ORDERS' },
  { key: 'Customers', label: 'CUSTOMERS' },
  { key: 'Products', label: 'PRODUCTS' },
  { key: 'Inventory', label: 'INVENTORY' },
  { key: 'Revenue', label: 'REVENUE' },
];
const PIE_COLORS = ['#A9662A', '#C9A15A', '#8A5220', '#D9BE8B', '#211D1A', '#C17F3E'];

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const ReportsPage = () => {
  const [tab, setTab] = useState('Sales');
  const [month, setMonth] = useState(currentMonthValue());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(() => {
    setLoading(true);
    adminAxios
      .get(`/reports/${tab.toLowerCase()}`, { params: { month } })
      .then(({ data: res }) => setData(res.data))
      .finally(() => setLoading(false));
  }, [tab, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCsv = () => {
    if (!data) return;
    const rows = [['Metric', 'Value'], ...Object.entries(data).filter(([, v]) => typeof v !== 'object')];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab.toLowerCase()}-report-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between max-480:flex-col max-480:items-stretch mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-ink">Reports</h1>
          <p className="text-xs text-muted">{data?.label}</p>
        </div>
        <div className="flex items-center gap-3 max-480:flex-col max-480:items-stretch max-480:w-full">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-cream-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink max-480:justify-center"
          >
            <FiDownload size={14} /> EXPORT
          </button>
        </div>
      </div>

      <div className="mb-6">
        <FilterTabs breakpoint={640} tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {loading || !data ? (
        <div className="p-10 flex justify-center">
          <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'Sales' && (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 min-641:grid-cols-3 min-1221:grid-cols-6 gap-3 mb-6">
                <StatCard label="Total Sales" value={formatPrice(data.totalSales)} tone="brand" />
                <StatCard label="Total Orders" value={data.totalOrders} tone="ink" />
                <StatCard label="Total Customers" value={data.totalCustomers} tone="ink" />
                <StatCard label="Avg Order Value" value={formatPrice(data.averageOrderValue)} tone="gold" />
                <StatCard label="Items Sold" value={data.itemsSold} tone="ink" />
                <StatCard label="Refunds" value={formatPrice(data.refunds)} tone="gold" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <div className="bg-white border border-cream-200 p-5">
                  <p className="text-xs tracking-widest text-muted mb-4">SALES OVERVIEW (DAILY)</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data.dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D8" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => formatPrice(v)} />
                      <Line type="monotone" dataKey="total" stroke="#A9662A" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white border border-cream-200 p-5">
                  <p className="text-xs tracking-widest text-muted mb-4">SALES BY PAYMENT METHOD</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={data.byPaymentMethod} dataKey="total" nameKey="method" outerRadius={90} label={(e) => e.method}>
                        {data.byPaymentMethod.map((entry, i) => (
                          <Cell key={entry.method} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatPrice(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white border border-cream-200 p-5">
                <p className="text-xs tracking-widest text-muted mb-4">TOP SELLING PRODUCTS</p>
                <StackTable
                  breakpoint={640}
                  rows={data.topProducts}
                  rowKey={(p) => p._id.product}
                  columns={[
                    { key: 'rank', label: '#', render: (p) => data.topProducts.indexOf(p) + 1 },
                    { key: 'product', label: 'Product', render: (p) => <span className="whitespace-nowrap">{p._id.name}</span> },
                    { key: 'unitsSold', label: 'Units Sold', render: (p) => p.unitsSold },
                    { key: 'totalSales', label: 'Total Sales', render: (p) => formatPrice(p.totalSales) },
                  ]}
                />
              </div>
            </>
          )}

          {tab === 'Orders' && (
            <>
              <div className="mb-6 max-w-xs">
                <StatCard label="Total Orders" value={data.total} tone="ink" />
              </div>
              <div className="bg-white border border-cream-200 p-5">
                <p className="text-xs tracking-widest text-muted mb-4">ORDERS BY STATUS</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D8" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#A9662A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {tab === 'Customers' && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="New Customers" value={data.newCustomers} tone="brand" />
              <StatCard label="Repeat Buyers" value={data.repeatBuyers} tone="gold" />
            </div>
          )}

          {tab === 'Products' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white border border-cream-200 p-5">
                <p className="text-xs tracking-widest text-muted mb-4">TOP SELLING PRODUCTS</p>
                <table className="w-full text-sm">
                  <tbody>
                    {data.topSelling.map((p) => (
                      <tr key={p._id.product} className="border-b border-cream-100 last:border-0">
                        <td className="py-2 text-ink">{p._id.name}</td>
                        <td className="py-2 text-muted text-right">{p.unitsSold} units</td>
                        <td className="py-2 text-ink text-right">{formatPrice(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white border border-cream-200 p-5">
                <p className="text-xs tracking-widest text-muted mb-4">CATEGORY PERFORMANCE</p>
                <table className="w-full text-sm">
                  <tbody>
                    {data.categoryPerformance.map((c) => (
                      <tr key={c._id} className="border-b border-cream-100 last:border-0">
                        <td className="py-2 text-ink">{c._id}</td>
                        <td className="py-2 text-ink text-right">{formatPrice(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'Inventory' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatCard label="Total Products" value={data.totalProducts} tone="ink" />
              <StatCard label="Total Units" value={data.totalUnits} tone="ink" />
              <StatCard label="Total Value" value={formatPrice(data.totalValue)} tone="brand" />
              <StatCard label="Low Stock" value={data.lowStock} tone="gold" />
              <StatCard label="Out of Stock" value={data.outOfStock} tone="ink" />
            </div>
          )}

          {tab === 'Revenue' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Gross Revenue" value={formatPrice(data.grossRevenue)} tone="ink" />
              <StatCard label="Discounts" value={formatPrice(data.discounts)} tone="gold" />
              <StatCard label="Shipping" value={formatPrice(data.shipping)} tone="ink" />
              <StatCard label="Net Revenue" value={formatPrice(data.netRevenue)} tone="brand" />
              <StatCard label="Cost of Goods Sold" value={formatPrice(data.costOfGoodsSold)} tone="ink" />
              <StatCard label="Gross Profit" value={`${formatPrice(data.grossProfit)} (${data.grossMarginPercent}%)`} tone="brand" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;