import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import PriceRangeSlider from './PriceRangeSlider';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-cream-200 py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs tracking-widest text-ink mb-1"
      >
        {title}
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
};

const CheckboxRow = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-muted cursor-pointer py-1">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="rounded border-cream-200 text-brand focus:ring-brand/40"
    />
    {label}
  </label>
);

const SIZES = ['30ml', '50ml', '70ml', '75ml', '100ml'];
const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'limited', label: 'Limited Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];
const RATING_OPTIONS = [4, 3, 2, 1];

const FilterSidebar = ({
  collections = [],
  fragranceFamilies = [],
  filters,
  onFilterChange,
  onRangeChange,
  onClearAll,
  mobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const multiToggle = (key, value) => {
    const current = filters[key] ? filters[key].split(',') : [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange(key, next.join(','));
  };

  const isChecked = (key, value) => (filters[key] ? filters[key].split(',').includes(value) : false);

  const body = (
    <>
      {collections.length > 0 && (
        <FilterSection title="COLLECTIONS">
          {collections.map((c) => (
            <CheckboxRow
              key={c._id}
              label={c.name}
              checked={isChecked('collection', c._id)}
              onChange={() => multiToggle('collection', c._id)}
            />
          ))}
        </FilterSection>
      )}

      {fragranceFamilies.length > 0 && (
        <FilterSection title="FRAGRANCE FAMILY">
          {fragranceFamilies.map((f) => (
            <CheckboxRow
              key={f._id}
              label={f.name}
              checked={isChecked('fragranceFamily', f._id)}
              onChange={() => multiToggle('fragranceFamily', f._id)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="PRICE (PKR)">
        <PriceRangeSlider
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={(min, max) => onRangeChange({ minPrice: min, maxPrice: max })}
        />
      </FilterSection>

      <FilterSection title="SIZE">
        {SIZES.map((s) => (
          <CheckboxRow key={s} label={s} checked={isChecked('size', s)} onChange={() => multiToggle('size', s)} />
        ))}
      </FilterSection>

      <FilterSection title="AVAILABILITY">
        {AVAILABILITY_OPTIONS.map((a) => (
          <CheckboxRow
            key={a.value}
            label={a.label}
            checked={filters.availability === a.value}
            onChange={() => onFilterChange('availability', filters.availability === a.value ? '' : a.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="RATING" defaultOpen={false}>
        {RATING_OPTIONS.map((r) => (
          <CheckboxRow
            key={r}
            label={`${r} Stars & Up`}
            checked={filters.rating === String(r)}
            onChange={() => onFilterChange('rating', filters.rating === String(r) ? '' : String(r))}
          />
        ))}
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Desktop sidebar - its own independently-scrolling column, pinned in
          place (sticky) below the header instead of scrolling away with the
          product grid. */}
      <aside className="hidden lg:block w-64 flex-shrink-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1 scrollbar-none">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs tracking-widest text-ink">FILTERS</h3>
          <button type="button" onClick={onClearAll} className="text-xs text-brand hover:underline">
            Clear All
          </button>
        </div>
        {body}
      </aside>

      {/* Mobile/tablet filter menu - slides in smoothly from the left, below lg (1024px) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          aria-label="Close filters overlay"
          onClick={onCloseMobile}
          className="absolute inset-0 bg-charcoal/40"
        />
        <div
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-cream shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-none ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-cream-200">
            <span className="font-serif text-lg text-ink">Filters</span>
            <button type="button" onClick={onCloseMobile} aria-label="Close filters" className="text-ink">
              <FiX size={22} />
            </button>
          </div>
          <div className="px-5 py-3">
            <div className="flex items-center justify-end mb-1">
              <button type="button" onClick={onClearAll} className="text-xs text-brand hover:underline">
                Clear All
              </button>
            </div>
            {body}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
