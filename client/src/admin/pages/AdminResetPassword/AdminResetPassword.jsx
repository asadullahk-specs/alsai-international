import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import BrandMark from '../../../components/BrandMark';

const rules = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v), label: 'Include uppercase and lowercase letters' },
  { test: (v) => /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v), label: 'Include numbers and symbols' },
];

const AdminResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAdminAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/admin/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <BrandMark className="w-7 h-7" color="#A9662A" />
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-ink">AL SA'I</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted mt-1">INTERNATIONAL</p>
        </div>

        <h2 className="font-serif text-2xl text-ink mb-1 text-center">Reset Admin Password</h2>
        <p className="text-muted text-sm mb-6 text-center">Choose a new password for your admin account</p>

        {error && (
          <div className="mb-5 rounded-md bg-charcoal/10 border border-charcoal/30 text-charcoal text-sm px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-md bg-brand/10 border border-brand/30 text-brand text-sm px-4 py-3">
            Password updated! Redirecting you to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>

            <div className="bg-white border border-cream-200 rounded-md p-4 space-y-1.5">
              {rules.map((rule) => {
                const passed = rule.test(password);
                return (
                  <div
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${passed ? 'text-brand' : 'text-muted'}`}
                  >
                    <FiCheck size={13} className={passed ? 'opacity-100' : 'opacity-30'} />
                    {rule.label}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-dark hover:bg-brand transition-colors text-white text-sm tracking-widest py-3 rounded-md disabled:opacity-60"
            >
              {submitting ? 'UPDATING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted mt-6">
          <Link to="/admin/login" className="text-brand hover:underline">
            Back to Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminResetPassword;
