const StatCard = ({ icon: Icon, label, value, tone = 'ink' }) => {
  const toneClasses = {
    ink: 'bg-cream-100 text-ink',
    brand: 'bg-brand/10 text-brand',
    green: 'bg-brand/10 text-brand',
    red: 'bg-charcoal/10 text-charcoal',
    gold: 'bg-gold/15 text-gold',
  };

  return (
    <div className="bg-white border border-cream-200 rounded-md p-4 flex items-center gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${toneClasses[tone]}`}>
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-lg font-serif text-ink leading-tight truncate">{value}</p>
        <p className="text-xs text-muted truncate">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
