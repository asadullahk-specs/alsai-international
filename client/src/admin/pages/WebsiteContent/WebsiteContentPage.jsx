import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { driveImg } from '../../../utils/driveImg';

const SectionCard = ({ title, description, onSave, children, savingLabel = 'Update' }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-cream-200 p-5">
      <p className="text-xs tracking-widest text-muted mb-1">{title}</p>
      {description && <p className="text-xs text-muted mb-3">{description}</p>}
      <div className="space-y-3">{children}</div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5 disabled:opacity-60"
      >
        {saving ? 'SAVING...' : saved ? 'SAVED ✓' : savingLabel.toUpperCase()}
      </button>
    </div>
  );
};

const inputClass = 'w-full px-4 py-2.5 border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand';

const WebsiteContentPage = () => {
  const [content, setContent] = useState(null);
  const [about, setAbout] = useState({ image: '', heading: '', description: '' });
  const [shopPage, setShopPage] = useState({ allBannerImage: '' });
  const [giftSetPage, setGiftSetPage] = useState({ bannerImage: '' });
  const [contact, setContact] = useState({ storeName: '', address: '', phone: '', email: '', whatsapp: '', workingHours: '' });
  const [footer, setFooter] = useState({ description: '', columns: [] });
  const [social, setSocial] = useState([]);
  const [announcement, setAnnouncement] = useState({ text: '', link: '', isActive: true });
  const [faqs, setFaqs] = useState([]);
  const [policies, setPolicies] = useState({ privacyPolicy: '', termsConditions: '', shippingPolicy: '', returnPolicy: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAxios.get('website-content').then(({ data }) => {
      const c = data.data.content;
      setContent(c);
      setAbout(c.aboutPage || {});
      setShopPage(c.shopPage || { allBannerImage: '' });
      setGiftSetPage(c.giftSetPage || { bannerImage: '' });
      setContact(c.contactInfo || {});
      setFooter(c.footer || { description: '', columns: [] });
      setSocial(c.socialLinks || []);
      setAnnouncement(c.announcementBar || { text: '', link: '', isActive: true });
      setFaqs(c.faqs || []);
      setPolicies(c.policies || {});
      setLoading(false);
    });
  }, []);

  if (loading || !content) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink mb-1">Website Content</h1>
      <p className="text-sm text-muted mb-6">Manage content that appears on your website.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <SectionCard title="ABOUT PAGE" description="Update the content for the About Us page." onSave={() => adminAxios.put('website-content/about-page', about)}>
          <input placeholder="About Image (Google Drive link)" value={about.image} onChange={(e) => setAbout({ ...about, image: e.target.value })} className={inputClass} />
          <input placeholder="Heading" value={about.heading} onChange={(e) => setAbout({ ...about, heading: e.target.value })} className={inputClass} />
          <textarea placeholder="Description" rows={3} value={about.description} onChange={(e) => setAbout({ ...about, description: e.target.value })} className={`${inputClass} resize-none`} />
        </SectionCard>

        <SectionCard
          title="SHOP PAGE"
          description="Background image shown behind the 'All Fragrances' banner on the Shop page. (Perfumes and Attars each get their own background from Admin &gt; Categories.)"
          onSave={() => adminAxios.put('website-content/shop-page', shopPage)}
        >
          <input
            placeholder="All Fragrances Banner Image (Google Drive link)"
            value={shopPage.allBannerImage}
            onChange={(e) => setShopPage({ ...shopPage, allBannerImage: e.target.value })}
            className={inputClass}
          />
          {shopPage.allBannerImage && (
            <div className="w-full h-24 bg-cream-100 rounded-md overflow-hidden">
              <img src={driveImg(shopPage.allBannerImage)} alt="Shop banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="GIFT SET PAGE"
          description="Background banner shown at the top of every individual gift set's product page."
          onSave={() => adminAxios.put('website-content/gift-set-page', giftSetPage)}
        >
          <input
            placeholder="Gift Set Page Banner Image (Google Drive link)"
            value={giftSetPage.bannerImage}
            onChange={(e) => setGiftSetPage({ ...giftSetPage, bannerImage: e.target.value })}
            className={inputClass}
          />
          {giftSetPage.bannerImage && (
            <div className="w-full h-24 bg-cream-100 rounded-md overflow-hidden">
              <img src={driveImg(giftSetPage.bannerImage)} alt="Gift set banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </SectionCard>

        <SectionCard title="CONTACT DETAILS" description="Update contact information displayed on website." onSave={() => adminAxios.put('website-content/contact-info', contact)}>
          <input placeholder="Store Name" value={contact.storeName} onChange={(e) => setContact({ ...contact, storeName: e.target.value })} className={inputClass} />
          <textarea placeholder="Address" rows={2} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className={`${inputClass} resize-none`} />
          <input placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={inputClass} />
          <input placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={inputClass} />
          <input placeholder="WhatsApp" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} className={inputClass} />
          <input placeholder="Working Hours" value={contact.workingHours} onChange={(e) => setContact({ ...contact, workingHours: e.target.value })} className={inputClass} />
        </SectionCard>

        <SectionCard title="FAQS" description="Manage frequently asked questions." onSave={() => adminAxios.put('website-content/faqs', faqs)}>
          {faqs.map((f, i) => (
            <div key={i} className="border border-cream-100 p-2 space-y-1">
              <div className="flex items-center justify-between">
                <input
                  placeholder="Question"
                  value={f.question}
                  onChange={(e) => setFaqs(faqs.map((x, xi) => (xi === i ? { ...x, question: e.target.value } : x)))}
                  className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none"
                />
                <button type="button" onClick={() => setFaqs(faqs.filter((_, xi) => xi !== i))} className="text-muted hover:text-charcoal ml-2">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <textarea
                placeholder="Answer"
                rows={2}
                value={f.answer}
                onChange={(e) => setFaqs(faqs.map((x, xi) => (xi === i ? { ...x, answer: e.target.value } : x)))}
                className="w-full text-sm border-b border-cream-200 py-1 focus:outline-none resize-none"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setFaqs([...faqs, { question: '', answer: '', displayOrder: faqs.length }])}
            className="flex items-center gap-1 text-xs text-brand"
          >
            <FiPlus size={12} /> Add FAQ
          </button>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 min-1301:grid-cols-3 gap-5 mb-5">
        <SectionCard title="FOOTER" description="Manage footer content and links." onSave={() => adminAxios.put('website-content/footer', footer)}>
          <textarea placeholder="Footer Description" rows={3} value={footer.description} onChange={(e) => setFooter({ ...footer, description: e.target.value })} className={`${inputClass} resize-none`} />
          <p className="text-xs text-muted">Footer link columns can be extended via the API; this panel manages the description shown above them.</p>
        </SectionCard>

        <SectionCard title="SOCIAL LINKS" description="Update social media links." onSave={() => adminAxios.put('website-content/social-links', social)}>
          {social.map((s, i) => (
            <div key={i} className="border border-cream-200 p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  placeholder="Platform"
                  value={s.platform}
                  onChange={(e) => setSocial(social.map((x, xi) => (xi === i ? { ...x, platform: e.target.value } : x)))}
                  className="flex-1 text-sm border border-cream-200 px-2 py-2"
                />
                <button type="button" onClick={() => setSocial(social.filter((_, xi) => xi !== i))} className="text-muted hover:text-charcoal flex-shrink-0">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <input
                placeholder="URL"
                value={s.url}
                onChange={(e) => setSocial(social.map((x, xi) => (xi === i ? { ...x, url: e.target.value } : x)))}
                className="w-full text-sm border border-cream-200 px-2 py-2"
              />
            </div>
          ))}
          <button type="button" onClick={() => setSocial([...social, { platform: '', url: '' }])} className="flex items-center gap-1 text-xs text-brand">
            <FiPlus size={12} /> Add Social Link
          </button>
        </SectionCard>

        <SectionCard title="ANNOUNCEMENT BAR" description="Update the announcement bar shown on top of website." onSave={() => adminAxios.put('website-content/announcement-bar', announcement)}>
          <input placeholder="Announcement Text" value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} className={inputClass} />
          <input placeholder="Link (optional)" value={announcement.link} onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })} className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={announcement.isActive} onChange={(e) => setAnnouncement({ ...announcement, isActive: e.target.checked })} />
            Enable Announcement Bar
          </label>
        </SectionCard>
      </div>

      <div className="bg-white border border-cream-200 p-5">
        <p className="text-xs tracking-widest text-muted mb-3">POLICIES</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['privacyPolicy', 'Privacy Policy'],
            ['termsConditions', 'Terms & Conditions'],
            ['shippingPolicy', 'Shipping Policy'],
            ['returnPolicy', 'Return Policy'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-muted block mb-1">{label}</label>
              <textarea
                rows={4}
                value={policies[key] || ''}
                onChange={(e) => setPolicies({ ...policies, [key]: e.target.value })}
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => adminAxios.put('website-content/policies', policies)}
          className="mt-4 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5"
        >
          UPDATE POLICIES
        </button>
      </div>
    </div>
  );
};

export default WebsiteContentPage;
