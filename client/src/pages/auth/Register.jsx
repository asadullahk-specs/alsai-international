import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff, FiCreditCard, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import BrandMark from '../../components/BrandMark';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    cnic: '',
    gender: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <BrandMark className="w-6 h-6" color="#C9A15A" />
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-ink">AL SA'I</h1>
          <p className="text-[10px] tracking-[0.3em] text-muted mt-1">INTERNATIONAL</p>
        </div>

        <div className="bg-white border border-cream-200 rounded-lg shadow-sm px-8 py-10">
          <p className="text-brand text-xs tracking-[0.2em] font-medium mb-2">CREATE ACCOUNT</p>
          <h2 className="font-serif text-2xl text-ink mb-1">Customer Registration</h2>
          <p className="text-muted text-sm mb-6">Create an account to get started</p>

          {error && (
            <div className="mb-5 rounded-md bg-charcoal/10 border border-charcoal/30 text-charcoal text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  name="cnic"
                  required
                  placeholder="CNIC (12345-1234567-1)"
                  pattern="\d{5}-\d{7}-\d{1}"
                  title="Enter CNIC in the format 12345-1234567-1"
                  value={form.cnic}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
              </div>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" size={16} />
                <input
                  type="date"
                  name="dob"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  placeholder="Date of Birth"
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-muted"
                />
              </div>
            </div>

            <div>
              <p className="text-xs tracking-widest text-muted mb-2">GENDER</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ].map((g) => (
                  <label
                    key={g.value}
                    className={`text-center text-sm py-2.5 rounded-md border cursor-pointer transition-colors ${form.gender === g.value ? 'border-brand text-brand bg-brand/5' : 'border-cream-200 text-muted'
                      }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g.value}
                      checked={form.gender === g.value}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-md border border-cream-200 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-muted pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-cream-200 text-brand focus:ring-brand/40"
              />
              <span>I agree to the Terms &amp; Conditions and Privacy Policy</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-dark transition-colors text-white text-sm tracking-widest py-3 rounded-md disabled:opacity-60"
            >
              {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;