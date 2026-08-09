import { useId } from 'react';

/**
 * Renders `tabs` as a horizontal tab strip above `breakpoint`px, and as a
 * single filter <select> below it - used anywhere a row of status/category
 * tabs would otherwise overflow or crowd a narrow admin panel.
 */
const FilterTabs = ({ breakpoint = 820, tabs, active, onChange }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const cls = `filtertabs-${uid}`;

  return (
    <div className={cls}>
      <style>{`
        .${cls} .ft-tabs { display: flex; }
        .${cls} .ft-select { display: none; }
        @media (max-width: ${breakpoint - 1}px) {
          .${cls} .ft-tabs { display: none; }
          .${cls} .ft-select { display: block; }
        }
      `}</style>

      <div className="ft-tabs items-center gap-2 overflow-x-auto px-4 pt-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`px-3 py-2 text-xs tracking-wide whitespace-nowrap border-b-2 transition-colors ${
              active === t.key ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ft-select px-4 pt-4">
        <select
          value={active}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-cream-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {tabs.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterTabs;
