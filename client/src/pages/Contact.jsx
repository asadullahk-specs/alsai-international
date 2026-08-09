import { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import publicAxios from '../api/publicAxios';

const Contact = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    publicAxios.get('/layout').then(({ data }) => setContactInfo(data.data.websiteContent?.contactInfo));
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await publicAxios.post('/contact', form);
      setStatus('success');
      setMessage(data.message);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-ink mb-2">Contact Us</h1>
          <p className="text-sm text-muted">We're here to help! Reach out to us for any questions, feedback, or assistance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-md p-7">
            <h2 className="font-serif text-xl text-ink mb-5">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              />
              {message && (
                <p className={`text-sm ${status === 'success' ? 'text-brand' : 'text-charcoal'}`}>{message}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand hover:bg-brand-dark text-white text-xs tracking-widest py-3 rounded-md transition-colors disabled:opacity-60"
              >
                {submitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
              <p className="text-xs text-muted text-center">We typically respond within 24 hours.</p>
            </form>
          </div>

          <div className="bg-white rounded-md p-7">
            <h2 className="font-serif text-xl text-ink mb-5">Contact Information</h2>
            {contactInfo ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <FiMapPin size={16} className="text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-ink font-medium">Our Store</p>
                    <p className="text-sm text-muted">{contactInfo.storeName}</p>
                    <p className="text-sm text-muted">{contactInfo.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiPhone size={16} className="text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-ink font-medium">Phone</p>
                    <p className="text-sm text-muted">{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMail size={16} className="text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-ink font-medium">Email</p>
                    <p className="text-sm text-muted">{contactInfo.email}</p>
                    <p className="text-xs text-muted">We reply within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock size={16} className="text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-ink font-medium">Working Hours</p>
                    <p className="text-sm text-muted">{contactInfo.workingHours}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-6 w-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
