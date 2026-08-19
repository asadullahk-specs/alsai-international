import { useState, useEffect } from 'react';
import { FiBold, FiItalic, FiUnderline, FiLink, FiRotateCcw } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';

const inputClass = 'w-full px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand';
const labelClass = 'text-xs text-muted block mb-1';

const wrapSelection = (textareaRef, before, after = before) => {
  const el = textareaRef.current;
  if (!el) return null;
  const { selectionStart, selectionEnd, value } = el;
  const selected = value.slice(selectionStart, selectionEnd);
  const next = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
  return next;
};

const EmailTemplatesPanel = () => {
  const [templates, setTemplates] = useState([]);
  const [activeKey, setActiveKey] = useState('order_confirmation');
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = { current: null };

  const fetchAll = () => {
    setLoading(true);
    adminAxios.get('/email-templates').then(({ data }) => {
      setTemplates(data.data.templates);
      const active = data.data.templates.find((t) => t.key === activeKey) || data.data.templates[0];
      if (active) {
        setActiveKey(active.key);
        setForm({ name: active.name, subject: active.subject, bodyHtml: active.bodyHtml });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTemplate = (t) => {
    setActiveKey(t.key);
    setForm({ name: t.name, subject: t.subject, bodyHtml: t.bodyHtml });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await adminAxios.put(`/email-templates/${activeKey}`, form);
      setTemplates((prev) => prev.map((t) => (t.key === activeKey ? data.data.template : t)));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!window.confirm('Reset this template to its default content? Unsaved changes will be lost.')) return;
    const { data } = await adminAxios.post(`/email-templates/${activeKey}/reset`);
    setTemplates((prev) => prev.map((t) => (t.key === activeKey ? data.data.template : t)));
    setForm({ name: data.data.template.name, subject: data.data.template.subject, bodyHtml: data.data.template.bodyHtml });
  };

  const applyWrap = (before, after) => {
    const next = wrapSelection(textareaRef, before, after);
    if (next != null) setForm((prev) => ({ ...prev, bodyHtml: next }));
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeTemplate = templates.find((t) => t.key === activeKey);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm text-ink">Email Templates</h2>
          <p className="text-xs text-muted">Customize your email templates and content</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetToDefault} className="flex items-center gap-1.5 border border-ink/20 text-ink text-xs tracking-widest px-4 py-2.5 hover:border-ink">
            <FiRotateCcw size={13} /> RESET TO DEFAULT
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 disabled:opacity-60"
          >
            {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE TEMPLATE'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-48 flex-shrink-0 bg-white border border-cream-200">
          {templates.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTemplate(t)}
              className={`w-full text-left px-4 py-3 text-xs tracking-wide border-l-2 transition-colors ${
                activeKey === t.key ? 'border-brand bg-cream-50 text-brand' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 bg-white border border-cream-200 p-5">
          <h3 className="text-xs tracking-widest text-ink mb-4">TEMPLATE SETTINGS</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Template Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email Subject</label>
              <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <label className={labelClass}>Email Content</label>
          <div className="border border-cream-200">
            <div className="flex items-center gap-1 border-b border-cream-200 px-2 py-1.5 bg-cream-50">
              <button type="button" onClick={() => applyWrap('<strong>', '</strong>')} className="p-1.5 text-muted hover:text-ink" title="Bold">
                <FiBold size={13} />
              </button>
              <button type="button" onClick={() => applyWrap('<em>', '</em>')} className="p-1.5 text-muted hover:text-ink" title="Italic">
                <FiItalic size={13} />
              </button>
              <button type="button" onClick={() => applyWrap('<u>', '</u>')} className="p-1.5 text-muted hover:text-ink" title="Underline">
                <FiUnderline size={13} />
              </button>
              <button type="button" onClick={() => applyWrap('<a href="">', '</a>')} className="p-1.5 text-muted hover:text-ink" title="Link">
                <FiLink size={13} />
              </button>
            </div>
            <textarea
              ref={(el) => {
                textareaRef.current = el;
              }}
              value={form.bodyHtml}
              onChange={(e) => setForm((p) => ({ ...p, bodyHtml: e.target.value }))}
              rows={12}
              className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-cream-200 p-4 mb-4">
            <h3 className="text-xs tracking-widest text-ink mb-3">AVAILABLE VARIABLES</h3>
            <div className="space-y-2">
              {(activeTemplate?.variables || []).map((v) => (
                <div key={v.token} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{v.label}</span>
                  <code className="text-brand bg-cream-50 px-1.5 py-0.5 rounded text-[10px]">{v.token}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white border border-cream-200 p-6">
        <h3 className="text-xs tracking-widest text-muted mb-4">PREVIEW</h3>
        <div className="max-w-md mx-auto rounded-md overflow-hidden border border-cream-200">
          <div className="bg-charcoal text-center py-6">
            <span className="text-brand text-xl tracking-[3px]" style={{ fontFamily: 'Georgia, serif' }}>
              AL SA&apos;I
            </span>
            <div className="text-brand text-[9px] tracking-[3px] mt-0.5">INTERNATIONAL</div>
          </div>
          <div className="p-6 bg-white" dangerouslySetInnerHTML={{ __html: form.bodyHtml }} />
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatesPanel;
