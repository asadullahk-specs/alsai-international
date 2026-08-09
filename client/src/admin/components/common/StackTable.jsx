import { useId } from 'react';

/**
 * Renders `columns` + `rows` as a normal <table> above `breakpoint`px, and as
 * stacked label-left/value-right cards below it - this is the "Orders
 * structure" pattern, reused across every admin list page.
 *
 * Uses an injected <style> media query (scoped to a unique class) rather
 * than Tailwind breakpoint classes, so any page can pass its own pixel
 * breakpoint without needing a matching Tailwind screen defined up front.
 *
 * columns: [{ key, label, render(row) => node, headClassName?, cellClassName? }]
 * rows: array of data objects
 * rowKey: (row) => string
 * actions: (row) => node - rendered right-aligned in both views
 */
const StackTable = ({ breakpoint = 1180, columns, rows, rowKey = (r) => r._id, actions }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const cls = `stacktable-${uid}`;

  return (
    <div className={cls}>
      <style>{`
        .${cls} .st-table { display: block; }
        .${cls} .st-cards { display: none; }
        @media (max-width: ${breakpoint - 1}px) {
          .${cls} .st-table { display: none; }
          .${cls} .st-cards { display: block; }
        }
      `}</style>

      <div className="st-table overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-left text-xs tracking-widest text-muted">
              {columns.map((c) => (
                <th key={c.key} className={`p-4 font-normal ${c.headClassName || ''}`}>
                  {c.label}
                </th>
              ))}
              {actions && <th className="p-4 font-normal text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-cream-100 last:border-0">
                {columns.map((c) => (
                  <td key={c.key} className={`p-4 ${c.cellClassName || ''}`}>
                    {c.render(row)}
                  </td>
                ))}
                {actions && (
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3 text-muted">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="st-cards divide-y divide-cream-100">
        {rows.map((row) => (
          <div key={rowKey(row)} className="p-4 space-y-2">
            {columns.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-xs tracking-wide text-muted flex-shrink-0 pt-0.5">{c.label}</span>
                <span className="text-right text-ink min-w-0">{c.render(row)}</span>
              </div>
            ))}
            {actions && <div className="flex items-center justify-end gap-3 text-muted pt-1">{actions(row)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StackTable;
