import { FiCheck } from 'react-icons/fi';

const STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const StepCircle = ({ step, isDone, compact }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
        isDone ? 'bg-brand text-white' : 'bg-cream-200 text-muted'
      }`}
    >
      {isDone && <FiCheck size={12} />}
    </div>
    {!compact && (
      <span className={`text-[9px] mt-1 whitespace-nowrap ${isDone ? 'text-ink' : 'text-muted'}`}>{step.label}</span>
    )}
  </div>
);

const OrderTrackingTimeline = ({ order, compact = false }) => {
  if (order.orderStatus === 'cancelled') {
    return <div className="text-sm text-charcoal bg-charcoal/10 rounded-md p-4">This order was cancelled.</div>;
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.orderStatus);

  // Below 640px the 6 steps no longer fit on one line, so they wrap into two
  // connected rows: 1-2-3 on top (left to right), then 6-5-4 on the bottom
  // (left to right), joined by a vertical connector between step 3 and step 4
  // on the right-hand side - a continuous "boustrophedon" path.
  const topIndices = [0, 1, 2];
  const bottomIndices = [5, 4, 3];

  return (
    <div>
      {/* Single row from 640px (sm) up */}
      <div className={`hidden sm:flex items-center ${compact ? 'mb-2' : 'mb-6'}`}>
        {STEPS.map((s, i) => {
          const isDone = i <= currentIndex;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <StepCircle step={s} isDone={isDone} compact={compact} />
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < currentIndex ? 'bg-brand' : 'bg-cream-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Two connected rows below 640px */}
      <div className={`sm:hidden ${compact ? 'mb-2' : 'mb-6'}`}>
        <div className="flex items-center">
          {topIndices.map((idx, pos) => {
            const isDone = idx <= currentIndex;
            return (
              <div key={STEPS[idx].key} className="flex items-center flex-1 last:flex-none">
                <StepCircle step={STEPS[idx]} isDone={isDone} compact={compact} />
                {pos < topIndices.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${topIndices[pos + 1] <= currentIndex ? 'bg-brand' : 'bg-cream-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end pr-3.5">
          <div className={`w-px h-4 ${3 <= currentIndex ? 'bg-brand' : 'bg-cream-200'}`} />
        </div>
        <div className="flex items-center">
          {bottomIndices.map((idx, pos) => {
            const isDone = idx <= currentIndex;
            return (
              <div key={STEPS[idx].key} className="flex items-center flex-1 last:flex-none">
                <StepCircle step={STEPS[idx]} isDone={isDone} compact={compact} />
                {pos < bottomIndices.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${bottomIndices[pos + 1] <= currentIndex ? 'bg-brand' : 'bg-cream-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!compact && order.statusTimeline?.length > 0 && (
        <div className="space-y-3 mt-6">
          {[...order.statusTimeline].reverse().map((entry, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-brand mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-ink capitalize">{entry.status}</p>
                {entry.note && <p className="text-xs text-muted">{entry.note}</p>}
                <p className="text-xs text-muted">{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTrackingTimeline;
