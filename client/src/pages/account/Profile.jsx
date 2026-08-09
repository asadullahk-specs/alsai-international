import { useState, useEffect } from 'react';
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiChevronDown,
  FiEdit2,
  FiX,
  FiUser,
  FiPhone,
  FiCalendar,
  FiMail,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import customerAxios from '../../api/customerAxios';
import { useAuth } from '../../context/AuthContext';

const passwordRules = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v), label: 'Include uppercase and lowercase letters' },
  { test: (v) => /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v), label: 'Include numbers and symbols' },
];

const ChangePasswordSection = () => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await customerAxios.put('/profile/password', { currentPassword, newPassword });
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-cream-200 rounded-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-sm text-ink font-medium flex items-center gap-2">
          <FiLock size={14} /> Change Password
        </span>
        <FiChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-cream-200 pt-4">
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
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
              className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="bg-cream-50 border border-cream-200 rounded-md p-4 space-y-1.5">
            {passwordRules.map((rule) => {
              const passed = rule.test(newPassword);
              return (
                <div key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? 'text-brand' : 'text-muted'}`}>
                  <FiCheck size={13} className={passed ? 'opacity-100' : 'opacity-30'} />
                  {rule.label}
                </div>
              );
            })}
          </div>

          {message && <p className="text-sm text-brand">{message}</p>}
          {error && <p className="text-sm text-charcoal">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-6 py-3 rounded-md transition-colors disabled:opacity-60 font-medium"
          >
            {submitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      )}
    </div>
  );
};

const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other' };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
      });
    }
  }, [user]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStartEdit = () => {
    setMessage('');
    setError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setMessage('');
    setError('');
    setForm({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dob: user?.dob ? user.dob.split('T')[0] : '',
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const { data } = await customerAxios.put('/profile', form);
      updateUser(data.data.customer);
      setMessage('Profile details updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-serif text-2xl text-ink mb-1">My Profile</h1>
      <p className="text-sm text-muted mb-6">Manage your account details and security settings.</p>

      <div className="space-y-6">
        {/* User Card */}
        <div className="bg-white border border-cream-200 rounded-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-cream-200 border-2 border-brand/20 flex items-center justify-center text-2xl text-ink font-serif font-bold flex-shrink-0">
              {user?.fullName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-lg text-ink font-medium">{user?.fullName}</h2>
              <p className="text-xs text-muted flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <FiMail size={13} className="text-brand" /> {user?.email}
              </p>
              <p className="text-xs text-muted mt-1">
                Member since{' '}
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="bg-brand text-white hover:bg-brand-dark px-4 py-2.5 rounded-md text-xs tracking-widest flex items-center gap-2 transition-all shadow-sm flex-shrink-0 font-medium"
            >
              <FiEdit2 size={14} /> EDIT DETAILS
            </button>
          )}
        </div>

        {/* Details Card: View Mode or Edit Form */}
        <div className="bg-white border border-cream-200 rounded-md p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-cream-200">
            <div>
              <h3 className="font-serif text-lg text-ink">Personal Information</h3>
              <p className="text-xs text-muted">
                {isEditing ? 'Update your personal details below.' : 'Your personal account details.'}
              </p>
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-muted hover:text-ink flex items-center gap-1 py-1.5 px-3 border border-cream-300 rounded-md transition-colors"
              >
                <FiX size={14} /> Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="text-xs text-brand hover:text-brand-dark font-medium flex items-center gap-1.5 py-1.5 px-3 border border-brand/30 hover:border-brand rounded-md transition-colors"
              >
                <FiEdit2 size={13} /> Edit Profile
              </button>
            )}
          </div>

          {message && !isEditing && (
            <div className="mb-6 p-3.5 bg-brand/10 border border-brand/20 rounded-md text-sm text-brand flex items-center gap-2">
              <FiCheckCircle size={16} /> {message}
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest text-muted uppercase font-medium flex items-center gap-1.5">
                    <FiUser size={13} className="text-brand" /> Full Name
                  </span>
                  <p className="text-sm font-medium text-ink bg-cream-50/50 p-3 rounded-md border border-cream-100">
                    {user?.fullName || '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest text-muted uppercase font-medium flex items-center gap-1.5">
                    <FiPhone size={13} className="text-brand" /> Phone Number
                  </span>
                  <p className="text-sm font-medium text-ink bg-cream-50/50 p-3 rounded-md border border-cream-100">
                    {user?.phone || 'Not provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest text-muted uppercase font-medium flex items-center gap-1.5">
                    <FiCalendar size={13} className="text-brand" /> Date of Birth
                  </span>
                  <p className="text-sm font-medium text-ink bg-cream-50/50 p-3 rounded-md border border-cream-100">
                    {user?.dob
                      ? new Date(user.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Not provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest text-muted uppercase font-medium flex items-center gap-1.5">
                    <FiUser size={13} className="text-brand" /> Gender
                  </span>
                  <p className="text-sm font-medium text-ink bg-cream-50/50 p-3 rounded-md border border-cream-100">
                    {GENDER_LABELS[user?.gender] || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest text-muted uppercase font-medium flex items-center gap-1.5">
                    <FiMail size={13} className="text-brand" /> Email Address
                  </span>
                  <p className="text-sm font-medium text-ink bg-cream-50/50 p-3 rounded-md border border-cream-100 flex items-center justify-between">
                    <span>{user?.email || '-'}</span>
                    <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                      Verified
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest text-muted uppercase font-medium flex items-center gap-1.5">
                    <FiShield size={13} className="text-brand" /> CNIC
                  </span>
                  <p className="text-sm font-medium text-ink bg-cream-50/50 p-3 rounded-md border border-cream-100">
                    {user?.cnic || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-6 py-3 rounded-md transition-colors flex items-center gap-2 font-medium"
                >
                  <FiEdit2 size={14} /> EDIT DETAILS
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5 font-medium">FULL NAME</label>
                <input
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-widest text-muted block mb-1.5 font-medium">PHONE NUMBER</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+92 300 0000000"
                    className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest text-muted block mb-1.5 font-medium">DATE OF BIRTH</label>
                  <input
                    type="date"
                    name="dob"
                    max={new Date().toISOString().split('T')[0]}
                    value={form.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border border-cream-200 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs tracking-widest text-muted block mb-1.5 font-medium">GENDER</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(GENDER_LABELS).map(([value, label]) => (
                    <label
                      key={value}
                      className={`text-center text-sm py-2.5 rounded-md border cursor-pointer transition-colors ${
                        form.gender === value ? 'border-brand text-brand bg-brand/5 font-medium' : 'border-cream-200 text-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={value}
                        checked={form.gender === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs tracking-widest text-muted block mb-1.5 flex items-center justify-between font-medium">
                    <span>EMAIL ADDRESS</span>
                    <span className="text-[10px] text-muted normal-case font-normal">(Read-only)</span>
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-md border border-cream-200 bg-cream-100/50 text-sm text-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest text-muted block mb-1.5 flex items-center justify-between font-medium">
                    <span>CNIC</span>
                    <span className="text-[10px] text-muted normal-case font-normal">(Read-only)</span>
                  </label>
                  <input
                    value={user?.cnic || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-md border border-cream-200 bg-cream-100/50 text-sm text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {message && <p className="text-sm text-brand font-medium pt-1">{message}</p>}
              {error && <p className="text-sm text-charcoal font-medium pt-1">{error}</p>}

              <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-6 py-3 rounded-md transition-colors disabled:opacity-60 font-medium"
                >
                  {submitting ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white hover:bg-cream-100 border border-cream-300 text-ink text-xs tracking-widest px-6 py-3 rounded-md transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>

        <ChangePasswordSection />
      </div>
    </div>
  );
};

export default Profile;
