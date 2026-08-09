import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import publicAxios from '../../api/publicAxios';

const Newsletter = ({ heading, description }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await publicAxios.post('/newsletter/subscribe', { email });
      setStatus('success');
      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-cream-100 rounded-md p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-brand flex-shrink-0">
            <FiMail size={18} />
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink">{heading || 'Stay in the Know'}</h3>
            {description && <p className="text-xs text-muted">{description}</p>}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto gap-2">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 w-full sm:w-64 px-4 py-3 rounded-md border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-6 py-3 rounded-md transition-colors disabled:opacity-60 w-full sm:w-auto"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
      {message && (
        <p className={`text-xs mt-2 text-center sm:text-right ${status === 'success' ? 'text-brand' : 'text-charcoal'}`}>
          {message}
        </p>
      )}
    </section>
  );
};

export default Newsletter;
