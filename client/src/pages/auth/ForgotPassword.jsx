import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import BrandMark from '../../components/BrandMark';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <BrandMark className="w-6 h-6" color="#C9A15A" />
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-ink">AL SA'I</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted mt-1">EXTRAIT DE PARFUM</p>
        </div>

        <div className="bg-white border border-cream-200 rounded-lg shadow-sm px-8 py-10 text-center">
          <p className="text-brand text-xs tracking-[0.2em] font-medium mb-2">RESET PASSWORD</p>
          <h2 className="font-serif text-2xl text-ink mb-2">Forgot Password?</h2>
          <p className="text-muted text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password
          </p>

          {error && (
            <div className="mb-5 text-left rounded-md bg-charcoal/10 border border-charcoal/30 text-charcoal text-sm px-4 py-3">
              {error}
            </div>
          )}

          {sent ? (
            <div className="rounded-md bg-brand/10 border border-brand/30 text-brand text-sm px-4 py-4">
              If an account exists for {email}, a reset link is on its way. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand hover:bg-brand-dark transition-colors text-white text-sm tracking-widest py-3 rounded-md disabled:opacity-60"
              >
                {submitting ? 'SENDING...' : 'SEND RESET LINK'}
              </button>
            </form>
          )}

          <Link to="/login" className="inline-flex items-center gap-1.5 text-brand text-sm mt-6 hover:underline">
            <FiArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
