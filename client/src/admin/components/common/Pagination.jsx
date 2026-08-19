import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-cream-200 text-muted disabled:opacity-30 hover:border-brand hover:text-brand transition-colors"
      >
        <FiChevronLeft size={16} />
      </button>
      <span className="text-xs font-medium tracking-widest text-ink px-2">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-cream-200 text-muted disabled:opacity-30 hover:border-brand hover:text-brand transition-colors"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
