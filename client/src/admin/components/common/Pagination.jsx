import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-cream-200 text-muted disabled:opacity-40 hover:border-brand hover:text-brand"
      >
        <FiChevronLeft size={14} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
            p === page ? 'bg-brand text-white' : 'border border-cream-200 text-muted hover:border-brand hover:text-brand'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-cream-200 text-muted disabled:opacity-40 hover:border-brand hover:text-brand"
      >
        <FiChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;
