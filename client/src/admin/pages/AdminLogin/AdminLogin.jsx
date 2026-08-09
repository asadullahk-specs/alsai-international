import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import BrandMark from '../../../components/BrandMark';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password, rememberMe);
      // Per the client's request, admin login always lands on the dashboard,
      // regardless of which page originally redirected here.
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 relative">
      <Link
        to="/"
        className="absolute top-6 right-6 text-xs tracking-widest text-muted hover:text-brand border border-cream-200 hover:border-brand px-4 py-2 transition-colors"
      >
        GO TO WEBSITE
      </Link>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <BrandMark className="w-7 h-7" color="#A9662A" />
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-ink">AL SA'I</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted mt-1">EXTRAIT DE PARFUM</p>
        </div>

        <div className="text-center mb-6">
          <p className="text-brand text-xs tracking-[0.2em] font-medium mb-2">WELCOME BACK</p>
          <h2 className="font-serif text-3xl text-ink mb-2">Admin Login</h2>
          <p className="text-muted text-sm">Sign in to access your admin dashboard</p>
        </div>

        {error && (
          <div className="mb-5 rounded-md bg-charcoal/10 border border-charcoal/30 text-charcoal text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="email"
              name="email"
              required
              placeholder="Admin Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-md border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-cream-200 text-brand focus:ring-brand/40"
              />
              Remember me
            </label>
            <Link to="/admin/forgot-password" className="text-brand hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-dark hover:bg-brand transition-colors text-white text-sm tracking-widest py-3 rounded-md disabled:opacity-60"
          >
            {submitting ? 'SIGNING IN...' : 'LOGIN TO DASHBOARD'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-cream-200" />
          <span className="text-muted text-xs">or</span>
          <div className="flex-1 h-px bg-cream-200" />
        </div>

        <div className="flex items-center justify-center gap-2 text-brand text-sm">
          <FiShield size={15} />
          <span>Secure Admin Access</span>
        </div>

        <p className="text-center text-xs text-muted mt-8">© {new Date().getFullYear()} AL SA'I. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
