import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import BrandMark from '../../components/BrandMark';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      await login(form.email, form.password);
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12 relative">
      <Link
        to="/"
        className="absolute top-6 right-6 text-xs tracking-widest text-muted hover:text-brand border border-cream-200 hover:border-brand px-4 py-2 transition-colors"
      >
        GO TO WEBSITE
      </Link>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <BrandMark className="w-6 h-6" color="#C9A15A" />
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-ink">AL SA'I</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted mt-1">INTERNATIONAL</p>
        </div>

        <div className="bg-white border border-cream-200 rounded-lg shadow-sm px-8 py-10">
          <p className="text-brand text-xs tracking-[0.2em] font-medium mb-2">WELCOME BACK</p>
          <h2 className="font-serif text-2xl text-ink mb-1">Customer Login</h2>
          <p className="text-muted text-sm mb-6">Log in to access your account</p>

          {location.state?.from && !error && (
            <div className="mb-5 rounded-md bg-brand/10 border border-brand/30 text-brand text-sm px-4 py-3">
              Please login to your account to continue.
            </div>
          )}

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
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
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
                className="w-full pl-10 pr-10 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
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
              <Link to="/forgot-password" className="text-brand hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-dark transition-colors text-white text-sm tracking-widest py-3 rounded-md disabled:opacity-60"
            >
              {submitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;