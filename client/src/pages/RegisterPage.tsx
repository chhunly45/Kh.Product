import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck, Sparkles, Store, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPasswordStrength, getPasswordStrengthLabel } from '../utils/password';

const safeImportMetaEnv = () => {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    return import.meta.env as Record<string, string>;
  }

  return {} as Record<string, string>;
};

const env = safeImportMetaEnv();
const captchaEnabled = env.VITE_CAPTCHA_ENABLED === 'true';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthLabel = passwordStrength ? getPasswordStrengthLabel(passwordStrength) : '';
  const isPasswordMatch = Boolean(formData.confirmPassword && formData.password && formData.confirmPassword === formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { firstName, lastName, email, phone, password, confirmPassword } = formData;
      if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Valid email address is required');
        setLoading(false);
        return;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim() || phone.trim();
      const payload = {
        displayName,
        phoneNumber: phone.trim(),
        password,
        ...(email.trim() ? { email: email.trim() } : {})
      } as { displayName: string; email?: string; password: string; phoneNumber: string };
      if (captchaEnabled) {
        (payload as any).captchaToken = 'placeholder';
      }

      const result = await register(payload);
      if (result && 'requiresEmailVerification' in result && result.requiresEmailVerification) {
        navigate(`/verify-email?identifier=${encodeURIComponent(result.identifier)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.12),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#f3f6fb_100%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0f766e] to-[#134e4a] p-8 text-white sm:p-10 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_35%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Konpuk" className="h-12 w-auto" />
              <div className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-emerald-50">
                ការចុះឈ្មោះអ្នកលក់ / Premium seller onboarding
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">បង្កើតគណនីអ្នកលក់</p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">បង្កើតគណនីអ្នកលក់ Create Your Seller Account</h1>
              <p className="max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                ចាប់ផ្តើមលក់ទំនិញរបស់អ្នកនៅលើ Konpuk ដោយឥតគិតថ្លៃ។
              </p>
              <p className="max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Join thousands of trusted Cambodian sellers and start selling today.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <Store className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">លក់បានងាយ</p>
                <p className="mt-1 text-sm text-emerald-50/85">Sell with Ease</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">មានអ្នកទិញជាច្រើន</p>
                <p className="mt-1 text-sm text-emerald-50/85">Reach More Buyers</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">មានសុវត្ថិភាព</p>
                <p className="mt-1 text-sm text-emerald-50/85">Safe &amp; Trusted</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
              <svg viewBox="0 0 400 220" className="w-full" aria-hidden="true">
                <rect x="30" y="40" width="340" height="140" rx="28" fill="rgba(255,255,255,0.16)" />
                <rect x="58" y="70" width="120" height="16" rx="8" fill="rgba(255,255,255,0.75)" />
                <rect x="58" y="98" width="190" height="12" rx="6" fill="rgba(255,255,255,0.42)" />
                <rect x="58" y="122" width="148" height="12" rx="6" fill="rgba(255,255,255,0.35)" />
                <rect x="262" y="78" width="78" height="72" rx="18" fill="#F0FDF4" />
                <path d="M288 108l12 13 24-27" stroke="#0F766E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="310" cy="152" r="26" fill="rgba(255,255,255,0.2)" />
                <path d="M310 138v28" stroke="white" strokeWidth="8" strokeLinecap="round" />
                <path d="M296 152h28" stroke="white" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 lg:p-10">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">ការចុះឈ្មោះអ្នកលក់ / Seller registration</p>
            <h2 className="text-2xl font-semibold text-text-primary">ចាប់ផ្តើមលក់ក្នុងរយៈពេលនាទី / Start selling in minutes</h2>
            <p className="text-sm text-muted">បង្កើតគណនីរបស់អ្នក ដើម្បីបោះពុម្ពផលិតផល សន្ទនាជាមួយអ្នកទិញ និងពង្រីកអាជីវកម្មរបស់អ្នក។ Create your account to list products, chat with buyers, and grow your business.</p>
          </div>

          {error && (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-secondary">នាមត្រកូល / First Name</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ឧ. សុខ / Sok"
                  className="mt-0 w-full rounded-3xl border border-muted bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-secondary">នាមខ្លួន / Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="ឧ. វណ្ណឌី / Vandy"
                  className="mt-0 w-full rounded-3xl border border-muted bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-secondary">អ៊ីមែល (ជាជម្រើស) / Email Address (Optional)</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-0 w-full rounded-3xl border border-muted bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-muted">សម្រាប់អ្នកដែលមិនមានអ៊ីមែល អ្នកអាចចុះឈ្មោះដោយប្រើលេខទូរស័ព្ទបាន។ If you don't have an email address, you can register using your phone number.</p>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-secondary">លេខទូរស័ព្ទ / Phone Number</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="012 345 678"
                className="mt-0 w-full rounded-3xl border border-muted bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                disabled={loading}
              />
            </label>
            {captchaEnabled && (
              <div className="rounded-3xl border border-muted bg-background p-4 text-sm text-text-secondary">
                CAPTCHA placeholder enabled. Implement CAPTCHA integration here when ready.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-secondary">ពាក្យសម្ងាត់ / Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="ពាក្យសម្ងាត់ / Password"
                  className="mt-0 w-full rounded-3xl border border-muted bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
                <p className="mt-2 text-sm text-muted">ប្រើយ៉ាងហោចណាស់ ៨ តួអក្សរ។ សូមបន្ថែមលេខ និងសញ្ញាពិសេសដើម្បីបង្កើនសុវត្ថិភាព។ Use at least 8 characters. Numbers and special characters are recommended.</p>
                {passwordStrength && (
                  <div className="mt-2 flex items-center justify-between rounded-2xl border border-muted bg-background px-3 py-2 text-sm text-text-secondary">
                    <span>
                      កម្លាំងពាក្យសម្ងាត់ / Password Strength:{' '}
                      <span className={
                        passwordStrength === 'Strong'
                          ? 'font-semibold text-emerald-600'
                          : passwordStrength === 'Medium'
                          ? 'font-semibold text-amber-600'
                          : 'font-semibold text-rose-600'
                      }>{passwordStrengthLabel}</span>
                    </span>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text-secondary">បញ្ជាក់ពាក្យសម្ងាត់ / Confirm Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ម្ដងទៀត / Re-enter your password"
                  className="mt-0 w-full rounded-3xl border border-muted bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={loading}
                />
                {formData.confirmPassword && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${isPasswordMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPasswordMatch ? <CheckCircle2 className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                    <span>{isPasswordMatch ? 'ត្រូវគ្នា / Passwords match' : 'មិនត្រូវគ្នា / Passwords do not match'}</span>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#0F766E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f6f63] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'កំពុងបង្កើតគណនី... / Creating account...' : 'បង្កើតគណនី / Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            មានគណនីរួចហើយ? / Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary">ចូលគណនី / Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


