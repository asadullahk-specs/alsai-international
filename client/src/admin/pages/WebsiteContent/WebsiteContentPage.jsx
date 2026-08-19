import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import adminAxios from '../../../api/adminAxios';
import { driveImg } from '../../../utils/driveImg';
import { ICON_OPTIONS } from '../../../utils/pageIcons';
import PolicyPageEditor from './PolicyPageEditor';

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
  const [about, setAbout] = useState({
    eyebrow: '',
    heading: '',
    description: '',
    image: '',
    video: '',
    storyHeading: '',
    storyBody: '',
    storyImage: '',
    storyVideo: '',
    values: [],
    milestones: [],
    craftEyebrow: '',
    craftHeading: '',
    craftImage: '',
    quoteText: '',
    quoteAuthor: '',
    closingImage: '',
    stats: [],
  });
  const [shopPage, setShopPage] = useState({ allBannerImage: '' });
  const [giftSetPage, setGiftSetPage] = useState({ bannerImage: '' });
  const [contact, setContact] = useState({ storeName: '', address: '', phone: '', email: '', whatsapp: '', workingHours: '', storeMapUrl: '' });
  const [contactPage, setContactPage] = useState({ heroImage: '', heroHeading: '', heroDescription: '' });
  const [faqsPage, setFaqsPage] = useState({ heroImage: '', heroHeading: '', heroDescription: '' });
  const [promotionsPage, setPromotionsPage] = useState({ heroImage: '', heroHeading: '', heroDescription: '' });
  const [footer, setFooter] = useState({ description: '', columns: [] });
  const [social, setSocial] = useState([]);
  const [announcement, setAnnouncement] = useState({ text: '', link: '', isActive: true });
  const [faqs, setFaqs] = useState([]);
  const [policies, setPolicies] = useState({ shipping: {}, terms: {}, privacy: {}, returns: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAxios.get('website-content').then(({ data }) => {
      const c = data.data.content;
      setContent(c);
      setAbout({
        eyebrow: '',
        heading: '',
        description: '',
        image: '',
        video: '',
        storyHeading: '',
        storyBody: '',
        storyImage: '',
        storyVideo: '',
        values: [],
        milestones: [],
        craftEyebrow: '',
        craftHeading: '',
        craftImage: '',
        quoteText: '',
        quoteAuthor: '',
        closingImage: '',
        stats: [],
        ...(c.aboutPage || {}),
      });
      setShopPage(c.shopPage || { allBannerImage: '' });
      setGiftSetPage(c.giftSetPage || { bannerImage: '' });
      setContact(c.contactInfo || {});
      setContactPage(c.contactPage || { heroImage: '', heroHeading: '', heroDescription: '' });
      setFaqsPage(c.faqsPage || { heroImage: '', heroHeading: '', heroDescription: '' });
      setPromotionsPage(c.promotionsPage || { heroImage: '', heroHeading: '', heroDescription: '' });
      setFooter(c.footer || { description: '', columns: [] });
      setSocial(c.socialLinks || []);
      setAnnouncement(c.announcementBar || { text: '', link: '', isActive: true });
      setFaqs(c.faqs || []);
      setPolicies(c.policies || { shipping: {}, terms: {}, privacy: {}, returns: {} });
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

      <div className="bg-white border border-cream-200 p-5 mb-5">
        <p className="text-xs tracking-widest text-muted mb-1">ABOUT PAGE / OUR STORY</p>
        <p className="text-xs text-muted mb-4">Manage every section of the About page - the intro banner, the Our Story narrative, brand values, milestones, and the closing quote.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <p className="text-[11px] tracking-widest text-brand">INTRO BANNER</p>
            <input placeholder="Eyebrow (e.g. THE ESSENCE OF LUXURY)" value={about.eyebrow} onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })} className={inputClass} />
            <input placeholder="Heading" value={about.heading} onChange={(e) => setAbout({ ...about, heading: e.target.value })} className={inputClass} />
            <textarea placeholder="Intro description" rows={3} value={about.description} onChange={(e) => setAbout({ ...about, description: e.target.value })} className={`${inputClass} resize-none`} />
            <input placeholder="Banner Image (Google Drive link)" value={about.image} onChange={(e) => setAbout({ ...about, image: e.target.value })} className={inputClass} />
            <input placeholder="Banner Video (Google Drive link, optional - shown instead of the image)" value={about.video} onChange={(e) => setAbout({ ...about, video: e.target.value })} className={inputClass} />
          </div>

          <div className="space-y-3">
            <p className="text-[11px] tracking-widest text-brand">OUR STORY</p>
            <input placeholder="Story Heading (e.g. Our Story)" value={about.storyHeading} onChange={(e) => setAbout({ ...about, storyHeading: e.target.value })} className={inputClass} />
            <textarea placeholder="Story body" rows={5} value={about.storyBody} onChange={(e) => setAbout({ ...about, storyBody: e.target.value })} className={`${inputClass} resize-none`} />
            <input placeholder="Story Image (Google Drive link)" value={about.storyImage} onChange={(e) => setAbout({ ...about, storyImage: e.target.value })} className={inputClass} />
            <input placeholder="Story Video (Google Drive link, optional - shown instead of the image)" value={about.storyVideo} onChange={(e) => setAbout({ ...about, storyVideo: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <p className="text-[11px] tracking-widest text-brand mb-2">BRAND VALUES</p>
            <div className="space-y-2">
              {about.values.map((v, i) => (
                <div key={i} className="border border-cream-100 p-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={v.icon || 'feather'}
                      onChange={(e) => setAbout({ ...about, values: about.values.map((x, xi) => (xi === i ? { ...x, icon: e.target.value } : x)) })}
                      className="text-xs border border-cream-200 px-2 py-1.5 flex-shrink-0"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Value title (e.g. Craftsmanship)"
                      value={v.title}
                      onChange={(e) => setAbout({ ...about, values: about.values.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)) })}
                      className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none min-w-0"
                    />
                    <button type="button" onClick={() => setAbout({ ...about, values: about.values.filter((_, xi) => xi !== i) })} className="text-muted hover:text-charcoal ml-2 flex-shrink-0">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    placeholder="Short description"
                    rows={2}
                    value={v.description}
                    onChange={(e) => setAbout({ ...about, values: about.values.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)) })}
                    className="w-full text-sm border-b border-cream-200 py-1 focus:outline-none resize-none"
                  />
                </div>
              ))}
              <button type="button" onClick={() => setAbout({ ...about, values: [...about.values, { icon: 'feather', title: '', description: '' }] })} className="flex items-center gap-1 text-xs text-brand">
                <FiPlus size={12} /> Add Value
              </button>
            </div>
          </div>

          <div>
            <p className="text-[11px] tracking-widest text-brand mb-2">MILESTONES / TIMELINE</p>
            <div className="space-y-2">
              {about.milestones.map((m, i) => (
                <div key={i} className="border border-cream-100 p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Year"
                      value={m.year}
                      onChange={(e) => setAbout({ ...about, milestones: about.milestones.map((x, xi) => (xi === i ? { ...x, year: e.target.value } : x)) })}
                      className="w-20 text-sm border-b border-cream-200 py-1 focus:outline-none flex-shrink-0"
                    />
                    <input
                      placeholder="Title"
                      value={m.title}
                      onChange={(e) => setAbout({ ...about, milestones: about.milestones.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)) })}
                      className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none"
                    />
                    <button type="button" onClick={() => setAbout({ ...about, milestones: about.milestones.filter((_, xi) => xi !== i) })} className="text-muted hover:text-charcoal flex-shrink-0">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    placeholder="Description"
                    rows={2}
                    value={m.description}
                    onChange={(e) => setAbout({ ...about, milestones: about.milestones.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)) })}
                    className="w-full text-sm border-b border-cream-200 py-1 focus:outline-none resize-none"
                  />
                </div>
              ))}
              <button type="button" onClick={() => setAbout({ ...about, milestones: [...about.milestones, { year: '', title: '', description: '' }] })} className="flex items-center gap-1 text-xs text-brand">
                <FiPlus size={12} /> Add Milestone
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="space-y-3">
            <p className="text-[11px] tracking-widest text-brand">OUR CRAFT (signed quote + image, e.g. "The Art of Perfumery")</p>
            <input placeholder="Eyebrow (e.g. OUR CRAFT)" value={about.craftEyebrow} onChange={(e) => setAbout({ ...about, craftEyebrow: e.target.value })} className={inputClass} />
            <input placeholder="Heading (e.g. The Art of Perfumery)" value={about.craftHeading} onChange={(e) => setAbout({ ...about, craftHeading: e.target.value })} className={inputClass} />
            <input placeholder="Craft Image (Google Drive link)" value={about.craftImage} onChange={(e) => setAbout({ ...about, craftImage: e.target.value })} className={inputClass} />
            {about.craftImage && (
              <div className="w-full h-24 bg-cream-100 overflow-hidden">
                <img src={driveImg(about.craftImage)} alt="Craft preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-[11px] tracking-widest text-brand">CLOSING QUOTE</p>
            <p className="text-xs text-muted -mt-1">
              Used above as the quote paired with the Craft Image. If no Craft Image is set, this renders on its own instead
              (over the Closing Image below, or centered if neither image is set).
            </p>
            <textarea placeholder="Quote text" rows={2} value={about.quoteText} onChange={(e) => setAbout({ ...about, quoteText: e.target.value })} className={`${inputClass} resize-none`} />
            <input placeholder="Quote author (e.g. Founder, AL SA'I)" value={about.quoteAuthor} onChange={(e) => setAbout({ ...about, quoteAuthor: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="space-y-3">
            <p className="text-[11px] tracking-widest text-brand">CLOSING IMAGE (fallback full-bleed quote background, used only when there's no Craft Image)</p>
            <input placeholder="Closing Image (Google Drive link)" value={about.closingImage} onChange={(e) => setAbout({ ...about, closingImage: e.target.value })} className={inputClass} />
            {about.closingImage && (
              <div className="w-full h-24 bg-cream-100 overflow-hidden">
                <img src={driveImg(about.closingImage)} alt="Closing preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-brand mb-2">TRUST BAR STATS (shown above the footer, e.g. "50+ Signature Scents")</p>
            <div className="space-y-2">
              {about.stats.map((s, i) => (
                <div key={i} className="border border-cream-100 p-2 flex items-center gap-2">
                  <select
                    value={s.icon || 'award'}
                    onChange={(e) => setAbout({ ...about, stats: about.stats.map((x, xi) => (xi === i ? { ...x, icon: e.target.value } : x)) })}
                    className="text-xs border border-cream-200 px-2 py-1.5 flex-shrink-0"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Value (e.g. 50+)"
                    value={s.value}
                    onChange={(e) => setAbout({ ...about, stats: about.stats.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)) })}
                    className="w-24 text-sm border-b border-cream-200 py-1 focus:outline-none flex-shrink-0"
                  />
                  <input
                    placeholder="Label (e.g. Signature Scents)"
                    value={s.label}
                    onChange={(e) => setAbout({ ...about, stats: about.stats.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)) })}
                    className="flex-1 text-sm border-b border-cream-200 py-1 focus:outline-none min-w-0"
                  />
                  <button type="button" onClick={() => setAbout({ ...about, stats: about.stats.filter((_, xi) => xi !== i) })} className="text-muted hover:text-charcoal flex-shrink-0">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setAbout({ ...about, stats: [...about.stats, { icon: 'award', value: '', label: '' }] })} className="flex items-center gap-1 text-xs text-brand">
                <FiPlus size={12} /> Add Stat
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await adminAxios.put('website-content/about-page', about);
          }}
          className="mt-5 bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-4 py-2.5"
        >
          UPDATE ABOUT PAGE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
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
          description="Background banner shown at the top of the Gift Sets page - the page shown when a shopper clicks 'Gift Sets' in the navbar. Not shown on individual gift set product pages."
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
          <input
            placeholder="Store Locator - Google Maps link (search your store on Google Maps, tap Share, paste the link here)"
            value={contact.storeMapUrl}
            onChange={(e) => setContact({ ...contact, storeMapUrl: e.target.value })}
            className={inputClass}
          />
        </SectionCard>

        <SectionCard
          title="CONTACT PAGE HERO"
          description="The banner shown at the top of the Contact Us page. Phone/email/address shown below it come from Contact Details above."
          onSave={() => adminAxios.put('website-content/contact-page', contactPage)}
        >
          <input placeholder="Heading (e.g. Contact Us)" value={contactPage.heroHeading} onChange={(e) => setContactPage({ ...contactPage, heroHeading: e.target.value })} className={inputClass} />
          <textarea placeholder="Description" rows={2} value={contactPage.heroDescription} onChange={(e) => setContactPage({ ...contactPage, heroDescription: e.target.value })} className={`${inputClass} resize-none`} />
          <input placeholder="Hero Image (Google Drive link)" value={contactPage.heroImage} onChange={(e) => setContactPage({ ...contactPage, heroImage: e.target.value })} className={inputClass} />
          {contactPage.heroImage && (
            <div className="w-full h-24 bg-cream-100 overflow-hidden">
              <img src={driveImg(contactPage.heroImage)} alt="Contact hero preview" className="w-full h-full object-cover" />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="FAQ PAGE HERO"
          description="The banner shown at the top of the FAQs page. The questions/answers themselves are managed below."
          onSave={() => adminAxios.put('website-content/faqs-page', faqsPage)}
        >
          <input placeholder="Heading (e.g. Frequently Asked Questions)" value={faqsPage.heroHeading} onChange={(e) => setFaqsPage({ ...faqsPage, heroHeading: e.target.value })} className={inputClass} />
          <textarea placeholder="Description" rows={2} value={faqsPage.heroDescription} onChange={(e) => setFaqsPage({ ...faqsPage, heroDescription: e.target.value })} className={`${inputClass} resize-none`} />
          <input placeholder="Hero Image (Google Drive link)" value={faqsPage.heroImage} onChange={(e) => setFaqsPage({ ...faqsPage, heroImage: e.target.value })} className={inputClass} />
          {faqsPage.heroImage && (
            <div className="w-full h-24 bg-cream-100 overflow-hidden">
              <img src={driveImg(faqsPage.heroImage)} alt="FAQ hero preview" className="w-full h-full object-cover" />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="PROMOTIONS PAGE HERO"
          description="The banner shown at the top of the Promotions page."
          onSave={() => adminAxios.put('website-content/promotions-page', promotionsPage)}
        >
          <input placeholder="Heading (e.g. Promotions & Offers)" value={promotionsPage.heroHeading} onChange={(e) => setPromotionsPage({ ...promotionsPage, heroHeading: e.target.value })} className={inputClass} />
          <textarea placeholder="Description" rows={2} value={promotionsPage.heroDescription} onChange={(e) => setPromotionsPage({ ...promotionsPage, heroDescription: e.target.value })} className={`${inputClass} resize-none`} />
          <input placeholder="Hero Image (Google Drive link)" value={promotionsPage.heroImage} onChange={(e) => setPromotionsPage({ ...promotionsPage, heroImage: e.target.value })} className={inputClass} />
          {promotionsPage.heroImage && (
            <div className="w-full h-24 bg-cream-100 overflow-hidden">
              <img src={driveImg(promotionsPage.heroImage)} alt="Promotions hero preview" className="w-full h-full object-cover" />
            </div>
          )}
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

      <div className="space-y-5">
        <p className="text-xs tracking-widest text-muted">POLICY PAGES</p>
        <PolicyPageEditor type="shipping" label="Shipping Policy" initial={policies.shipping} />
        <PolicyPageEditor type="returns" label="Return Policy" initial={policies.returns} />
        <PolicyPageEditor type="terms" label="Terms & Conditions" initial={policies.terms} />
        <PolicyPageEditor type="privacy" label="Privacy Policy" initial={policies.privacy} />
      </div>
    </div>
  );
};

export default WebsiteContentPage;
