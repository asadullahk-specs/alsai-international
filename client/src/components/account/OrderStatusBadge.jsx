const STATUS_STYLES = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-ink/10 text-ink',
  processing: 'bg-ink/10 text-ink',
  packed: 'bg-cream-200 text-muted',
  shipped: 'bg-brand/10 text-brand',
  delivered: 'bg-brand/10 text-brand',
  cancelled: 'bg-charcoal/10 text-charcoal',
};

const OrderStatusBadge = ({ status }) => (
  <span
    className={`inline-block text-[10px] tracking-wide px-2 py-1 rounded-full capitalize ${
      STATUS_STYLES[status] || 'bg-cream-200 text-muted'
    }`}
  >
    {status}
  </span>
);

export default OrderStatusBadge;
