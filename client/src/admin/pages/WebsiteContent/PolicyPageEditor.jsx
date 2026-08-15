import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { driveImg } from '../../../utils/driveImg';
import { ICON_OPTIONS } from '../../../utils/pageIcons';

const inputClass = 'w-full px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand';
const EMPTY = { heroImage: '', heroHeading: '', heroDescription: '', highlightCards: [], sections: [], bulletsHeading: '', bullets: [], showNeedHelp: false };

const move = (arr, i, dir) => {
  const next = [...arr];
  const j = i + dir;
  if (j < 0 || j >= next.length) return arr;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

// One admin editor for a single policy-type page (Shipping / Terms /
// Privacy / Returns). All four use the same flexible content shape, so this
// single component - parameterized by `type` and `label` - covers every
// page instead of four near-duplicate blocks of JSX.
const PolicyPageEditor = ({ type, label, initial }) => {
  const [page, setPage] = useState({ ...EMPTY, ...(initial || {}) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPage({ ...EMPTY, ...(initial || {}) });
  }, [initial]);

  const set = (patch) => setPage((p) => ({ ...p, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminAxios.put(`website-content/policies/${type}`, page);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-cream-200 p-5">
      <p className="text-xs tracking-widest text-muted mb-4">{label.toUpperCase()}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <p className="text-[11px] tracking-widest text-brand">HERO BANNER</p>
          <input placeholder={`Heading (defaults to "${label}")`} value={page.heroHeading} onChange={(e) => set({ heroHeading: e.target.value })} className={inputClass} />
          <textarea placeholder="Description" rows={2} value={page.heroDescription} onChange={(e) => set({ heroDescription: e.target.value })} className={`${inputClass} resize-none`} />
          <input placeholder="Hero Image (Google Drive link)" value={page.heroImage} onChange={(e) => set({ heroImage: e.target.value })} className={inputClass} />
          {page.heroImage && (
            <div className="w-full h-24 bg-cream-100 overflow-hidden">
              <img src={driveImg(page.heroImage)} alt="Hero preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] tracking-widest text-brand mb-2">HIGHLIGHT CARDS (icon row - e.g. Processing Time, Free Shipping)</p>
          <div className="space-y-2">
            {page.highlightCards.map((c, i) => (
              <div key={i} className="border border-cream-100 p-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <select
                    value={c.icon}
                    onChange={(e) => set({ highlightCards: page.highlightCards.map((x, xi) => (xi === i ? { ...x, icon: e.target.value } : x)) })}
                    className="text-xs border border-cream-200 px-2 py-1.5 flex-shrink-0"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Title"
                    value={c.title}
                    onChange={(e) => set({ highlightCards: page.highlightCards.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)) })}
                    className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none min-w-0"
                  />
                  <button type="button" onClick={() => set({ highlightCards: page.highlightCards.filter((_, xi) => xi !== i) })} className="text-muted hover:text-charcoal flex-shrink-0">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <textarea
                  placeholder="Description"
                  rows={2}
                  value={c.description}
                  onChange={(e) => set({ highlightCards: page.highlightCards.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)) })}
                  className="w-full text-sm border-b border-cream-200 py-1 focus:outline-none resize-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set({ highlightCards: [...page.highlightCards, { icon: 'box', title: '', description: '' }] })}
              className="flex items-center gap-1 text-xs text-brand"
            >
              <FiPlus size={12} /> Add Highlight Card
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] tracking-widest text-brand mb-2">
          NUMBERED SECTIONS (adds an auto table-of-contents sidebar - e.g. Terms &amp; Conditions style)
        </p>
        <div className="space-y-2">
          {page.sections.map((s, i) => (
            <div key={i} className="border border-cream-100 p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted w-6 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <input
                  placeholder="Section heading (e.g. Introduction)"
                  value={s.heading}
                  onChange={(e) => set({ sections: page.sections.map((x, xi) => (xi === i ? { ...x, heading: e.target.value } : x)) })}
                  className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none min-w-0"
                />
                <button type="button" onClick={() => set({ sections: move(page.sections, i, -1) })} className="text-muted hover:text-charcoal flex-shrink-0">
                  <FiChevronUp size={14} />
                </button>
                <button type="button" onClick={() => set({ sections: move(page.sections, i, 1) })} className="text-muted hover:text-charcoal flex-shrink-0">
                  <FiChevronDown size={14} />
                </button>
                <button type="button" onClick={() => set({ sections: page.sections.filter((_, xi) => xi !== i) })} className="text-muted hover:text-charcoal flex-shrink-0">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <textarea
                placeholder="Section body"
                rows={3}
                value={s.body}
                onChange={(e) => set({ sections: page.sections.map((x, xi) => (xi === i ? { ...x, body: e.target.value } : x)) })}
                className="w-full text-sm border-b border-cream-200 py-1 focus:outline-none resize-none"
              />
            </div>
          ))}
          <button type="button" onClick={() => set({ sections: [...page.sections, { heading: '', body: '' }] })} className="flex items-center gap-1 text-xs text-brand">
            <FiPlus size={12} /> Add Section
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <p className="text-[11px] tracking-widest text-brand mb-2">BULLET LIST (e.g. Important Information / Return Guidelines)</p>
          <input
            placeholder="Bullet list heading"
            value={page.bulletsHeading}
            onChange={(e) => set({ bulletsHeading: e.target.value })}
            className={`${inputClass} mb-2`}
          />
          <div className="space-y-1.5">
            {page.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={b}
                  onChange={(e) => set({ bullets: page.bullets.map((x, xi) => (xi === i ? e.target.value : x)) })}
                  className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none"
                />
                <button type="button" onClick={() => set({ bullets: page.bullets.filter((_, xi) => xi !== i) })} className="text-muted hover:text-charcoal flex-shrink-0">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set({ bullets: [...page.bullets, ''] })} className="flex items-center gap-1 text-xs text-brand">
              <FiPlus size={12} /> Add Bullet
            </button>
          </div>
        </div>

        <div>
          <p className="text-[11px] tracking-widest text-brand mb-2">NEED HELP CARD</p>
          <label className="flex items-center gap-2 text-sm text-muted mb-2">
            <input type="checkbox" checked={page.showNeedHelp} onChange={(e) => set({ showNeedHelp: e.target.checked })} />
            Show a "Need Help?" card with the store's phone &amp; email (from Contact Details below)
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 disabled:opacity-60"
      >
        {saving ? 'SAVING...' : saved ? 'SAVED ✓' : `UPDATE ${label.toUpperCase()}`}
      </button>
    </div>
  );
};

export default PolicyPageEditor;
