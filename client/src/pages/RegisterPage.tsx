import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const captchaEnabled = import.meta.env.VITE_CAPTCHA_ENABLED === 'true';

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
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const payload = {
        displayName: `${firstName.trim()} ${lastName.trim()}`,
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 shadow-2xl ring-1 ring-slate-200">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Create your seller account</p>
          <h1 className="text-3xl font-semibold text-slate-900">Register to sell locally</h1>
          <p className="text-sm text-slate-500">Join thousands of sellers and post products in minutes.</p>
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">First Name</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Sophea"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Last Name</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Rath"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address (optional)</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-slate-500">Optional for rural sellers. Leave blank to register with phone only.</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone Number</span>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010 123 456"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              disabled={loading}
            />
          </label>
          {captchaEnabled && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              CAPTCHA placeholder enabled. Implement CAPTCHA integration here when ready.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
