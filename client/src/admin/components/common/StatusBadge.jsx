const TONE_MAP = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-ink/10 text-ink',
  processing: 'bg-ink/10 text-ink',
  packed: 'bg-cream-200 text-muted',
  shipped: 'bg-brand/10 text-brand',
  delivered: 'bg-brand/10 text-brand',
  cancelled: 'bg-charcoal/10 text-charcoal',
  paid: 'bg-brand/10 text-brand',
  failed: 'bg-charcoal/10 text-charcoal',
  refunded: 'bg-cream-200 text-muted',
  active: 'bg-brand/10 text-brand',
  inactive: 'bg-cream-200 text-muted',
  approved: 'bg-brand/10 text-brand',
  rejected: 'bg-charcoal/10 text-charcoal',
  unread: 'bg-brand/10 text-brand',
  read: 'bg-cream-200 text-muted',
  archived: 'bg-cream-200 text-muted',
  in_stock: 'bg-brand/10 text-brand',
  low_stock: 'bg-gold/15 text-gold',
  out_of_stock: 'bg-charcoal/10 text-charcoal',
};

const StatusBadge = ({ status }) => (
  <span
    className={`text-[10px] tracking-wide px-2 py-1 rounded-full whitespace-nowrap capitalize ${
      TONE_MAP[status] || 'bg-cream-200 text-muted'
    }`}
  >
    {String(status).replace(/_/g, ' ')}
  </span>
);

export default StatusBadge;
