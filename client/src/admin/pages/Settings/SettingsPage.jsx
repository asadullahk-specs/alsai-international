import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSettings, FiTag, FiCreditCard, FiMail, FiFileText, FiShield } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import EmailTemplatesPanel from './EmailTemplatesPanel';

const NAV = [
  { key: 'General', icon: FiSettings },
  { key: 'Shipping', icon: FiTag },
  { key: 'Pricing', icon: FiTag },
  { key: 'Payments', icon: FiCreditCard },
  { key: 'Email', icon: FiMail },
  { key: 'Templates', icon: FiFileText },
  { key: 'Security', icon: FiShield },
];
const inputClass = 'w-full px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand';
const labelClass = 'text-xs text-muted block mb-1';

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between py-2">
    <span className="text-sm text-ink">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${checked ? 'bg-brand' : 'bg-cream-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </label>
);

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = NAV.find((n) => n.key === searchParams.get('tab'))?.key || 'General';
  const [tab, setTab] = useState(initialTab);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = () => {
    adminAxios.get('settings').then(({ data }) => {
      setSettings(data.data.settings);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const update = (section, field, value) => {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const save = async (section) => {
    setSaving(true);
    setSaved(false);
    try {
      await adminAxios.put(`settings/${section}`, settings[section]);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SaveButton = ({ section }) => (
    <button
      type="button"
      onClick={() => save(section)}
      disabled={saving}
      className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-5 py-2.5 disabled:opacity-60"
    >
      {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE CHANGES'}
    </button>
  );

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-1">Settings</h1>
      <p className="text-sm text-muted mb-6">Manage your store information and preferences.</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 flex-shrink-0 bg-white border border-cream-200 h-fit max-640:hidden">
          {NAV.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-2.5 text-left px-4 py-3 text-xs tracking-wide border-l-2 transition-colors ${
                tab === key ? 'border-brand bg-cream-50 text-brand' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon size={14} className="flex-shrink-0" />
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="hidden max-640:block">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="w-full px-4 py-2.5 border border-cream-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {NAV.map(({ key }) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-0">
          {tab === 'Templates' && <EmailTemplatesPanel />}

          {tab === 'Pricing' && (
            <div className="bg-white border border-cream-200 p-5 max-w-2xl space-y-4">
              <Toggle checked={settings.pricing.taxEnabled} onChange={(v) => update('pricing', 'taxEnabled', v)} label="Enable Sales Tax" />
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Tax Label</label>
                  <input value={settings.pricing.taxLabel} onChange={(e) => update('pricing', 'taxLabel', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tax Rate (%)</label>
                  <input type="number" value={settings.pricing.taxRatePercent} onChange={(e) => update('pricing', 'taxRatePercent', Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <Toggle checked={settings.pricing.pricesIncludeTax} onChange={(v) => update('pricing', 'pricesIncludeTax', v)} label="Prices Already Include Tax" />
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4 pt-2">
                <div>
                  <label className={labelClass}>Currency Symbol</label>
                  <input value={settings.pricing.currencySymbol} onChange={(e) => update('pricing', 'currencySymbol', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Currency Position</label>
                  <select value={settings.pricing.currencyPosition} onChange={(e) => update('pricing', 'currencyPosition', e.target.value)} className={inputClass}>
                    <option value="before">Before amount (PKR 500)</option>
                    <option value="after">After amount (500 PKR)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Price Rounding</label>
                  <select value={settings.pricing.priceRounding} onChange={(e) => update('pricing', 'priceRounding', e.target.value)} className={inputClass}>
                    <option value="none">No Rounding</option>
                    <option value="nearest10">Nearest 10</option>
                    <option value="nearest100">Nearest 100</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Default Profit Margin (%)</label>
                  <input type="number" value={settings.pricing.defaultProfitMarginPercent} onChange={(e) => update('pricing', 'defaultProfitMarginPercent', Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <Toggle checked={settings.pricing.showCompareAtPrice} onChange={(v) => update('pricing', 'showCompareAtPrice', v)} label="Show Compare-at (Sale) Price" />
              <SaveButton section="pricing" />
            </div>
          )}

          {tab === 'General' && (
            <div className="bg-white border border-cream-200 p-5 max-w-2xl space-y-4">
              <div>
                <label className={labelClass}>Website Name</label>
                <input value={settings.general.websiteName} onChange={(e) => update('general', 'websiteName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Store Email</label>
                <input value={settings.general.storeEmail} onChange={(e) => update('general', 'storeEmail', e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Currency</label>
                  <input value={settings.general.currency} onChange={(e) => update('general', 'currency', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <input value={settings.general.language} onChange={(e) => update('general', 'language', e.target.value)} className={inputClass} />
                </div>
              </div>
              <Toggle checked={settings.general.maintenanceMode} onChange={(v) => update('general', 'maintenanceMode', v)} label="Maintenance Mode" />
              <Toggle checked={settings.general.allowCustomerRegistration} onChange={(v) => update('general', 'allowCustomerRegistration', v)} label="Allow Customer Self-Registration" />
              <SaveButton section="general" />
            </div>
          )}

          {tab === 'Shipping' && (
            <div className="bg-white border border-cream-200 p-5 max-w-2xl space-y-4">
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Delivery Charge (PKR)</label>
                  <input type="number" value={settings.shipping.deliveryChargePKR} onChange={(e) => update('shipping', 'deliveryChargePKR', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Free Shipping Above (PKR)</label>
                  <input type="number" value={settings.shipping.freeShippingThresholdPKR} onChange={(e) => update('shipping', 'freeShippingThresholdPKR', Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Estimated Delivery Time</label>
                <input value={settings.shipping.estimatedDeliveryTime} onChange={(e) => update('shipping', 'estimatedDeliveryTime', e.target.value)} className={inputClass} />
              </div>
              <Toggle checked={settings.shipping.codAvailable} onChange={(v) => update('shipping', 'codAvailable', v)} label="Cash on Delivery Available" />
              <SaveButton section="shipping" />
            </div>
          )}

          {tab === 'Payments' && (
            <div className="bg-white border border-cream-200 p-5 max-w-2xl space-y-2">
              <Toggle checked={settings.payment.codEnabled} onChange={(v) => update('payment', 'codEnabled', v)} label="Cash on Delivery" />
              <Toggle checked={settings.payment.bankTransferEnabled} onChange={(v) => update('payment', 'bankTransferEnabled', v)} label="Bank Transfer" />
              <Toggle checked={settings.payment.easyPaisaEnabled} onChange={(v) => update('payment', 'easyPaisaEnabled', v)} label="EasyPaisa" />
              <Toggle checked={settings.payment.jazzCashEnabled} onChange={(v) => update('payment', 'jazzCashEnabled', v)} label="JazzCash" />
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4 pt-2">
                <div>
                  <label className={labelClass}>EasyPaisa Merchant Number</label>
                  <input value={settings.payment.merchantNumbers?.easyPaisa || ''} onChange={(e) => update('payment', 'merchantNumbers', { ...settings.payment.merchantNumbers, easyPaisa: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>JazzCash Merchant Number</label>
                  <input value={settings.payment.merchantNumbers?.jazzCash || ''} onChange={(e) => update('payment', 'merchantNumbers', { ...settings.payment.merchantNumbers, jazzCash: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="pt-2">
                <SaveButton section="payment" />
              </div>
            </div>
          )}

          {tab === 'Email' && (
            <div className="bg-white border border-cream-200 p-5 max-w-2xl space-y-4">
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>SMTP Host</label>
                  <input value={settings.email.smtpHost} onChange={(e) => update('email', 'smtpHost', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>SMTP Port</label>
                  <input type="number" value={settings.email.smtpPort} onChange={(e) => update('email', 'smtpPort', Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>From Email</label>
                  <input value={settings.email.fromEmail} onChange={(e) => update('email', 'fromEmail', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>From Name</label>
                  <input value={settings.email.fromName} onChange={(e) => update('email', 'fromName', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="pt-2 space-y-1">
                <Toggle checked={settings.email.notifyOnOrder} onChange={(v) => update('email', 'notifyOnOrder', v)} label="Order Notifications" />
                <Toggle checked={settings.email.notifyOnNewCustomer} onChange={(v) => update('email', 'notifyOnNewCustomer', v)} label="New Customer Notifications" />
                <Toggle checked={settings.email.notifyOnLowStock} onChange={(v) => update('email', 'notifyOnLowStock', v)} label="Low Stock Alerts" />
                <Toggle checked={settings.email.notifyNewsletter} onChange={(v) => update('email', 'notifyNewsletter', v)} label="Newsletter Emails" />
              </div>
              <SaveButton section="email" />
            </div>
          )}

          {tab === 'Security' && (
            <div className="bg-white border border-cream-200 p-5 max-w-2xl space-y-4">
              <div className="grid grid-cols-2 max-480:grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Minimum Password Length</label>
                  <input type="number" value={settings.security.minPasswordLength} onChange={(e) => update('security', 'minPasswordLength', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Failed Login Limit</label>
                  <input type="number" value={settings.security.failedLoginLimit} onChange={(e) => update('security', 'failedLoginLimit', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Lock Duration (minutes)</label>
                  <input type="number" value={settings.security.accountLockMinutes} onChange={(e) => update('security', 'accountLockMinutes', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Admin Session Timeout (minutes)</label>
                  <input type="number" value={settings.security.adminSessionTimeoutMinutes} onChange={(e) => update('security', 'adminSessionTimeoutMinutes', Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <Toggle checked={settings.security.requireUppercase} onChange={(v) => update('security', 'requireUppercase', v)} label="Require Uppercase Letter" />
                <Toggle checked={settings.security.requireNumber} onChange={(v) => update('security', 'requireNumber', v)} label="Require a Number" />
                <Toggle checked={settings.security.requireSpecialChar} onChange={(v) => update('security', 'requireSpecialChar', v)} label="Require Special Character" />
                <Toggle checked={settings.security.twoFactorEnabled} onChange={(v) => update('security', 'twoFactorEnabled', v)} label="Two-Factor Authentication (future-ready)" />
              </div>
              <SaveButton section="security" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
