import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resendLoginOtp } from '../services/auth.api';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [stage, setStage] = useState<'credentials' | 'otp'>('credentials');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    if (resendCooldown > 0) {
      timer = window.setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, emailOrPhone: e.target.value }));
    setError('');
  };

  const buildIdentifier = (input: string) => {
    const normalized = input.trim();
    if (normalized.includes('@')) return normalized.toLowerCase();
    return `${normalized.replace(/\D/g, '') || 'user'}@marketplace.kh`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    try {
      if (!formData.emailOrPhone.trim()) {
        setError('Email or phone is required');
        return;
      }
      if (!formData.password) {
        setError('Password is required');
        return;
      }

      const payload = {
        identifier: buildIdentifier(formData.emailOrPhone),
        password: formData.password
      };

      const result = await login(payload as any);
      if (result && 'requiresOtp' in result && result.requiresOtp) {
        setStage('otp');
        setIdentifier(payload.identifier);
        setStatus('Enter the verification code sent to your email.');
        setResendCooldown(result.resendCooldownSeconds || 60);
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    try {
      if (!otpCode.trim() || otpCode.trim().length !== 6) {
        setError('Please enter the 6-digit verification code.');
        return;
      }

      await verifyLoginOtp({ identifier, code: otpCode.trim() });
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setStatus('');
    setLoading(true);

    try {
      const response = await resendLoginOtp({ identifier: buildIdentifier(formData.emailOrPhone) });
      setStatus('A fresh code was sent to your email.');
      setResendCooldown(response.resendCooldownSeconds || 60);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to resend verification code.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Welcome back</p>
        <h1 className="text-3xl font-semibold text-slate-900">Log in to your account</h1>
        <p className="text-sm text-slate-500">Enter your email and password to manage listings, chat, and favorites.</p>
      </div>

      {status && (
        <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
          {status}
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          {error.includes('Email not verified') && (
            <p className="mt-2 text-sm text-red-700">
              <a
                href={`/verify-email?identifier=${encodeURIComponent(buildIdentifier(formData.emailOrPhone))}`}
                className="font-semibold underline"
              >Verify your email</a>
            </p>
          )}
        </div>
      )}

      {stage === 'credentials' ? (
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email or Phone</span>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleIdentifierChange}
              placeholder="Email or phone number"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              disabled={loading}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********" 
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" 
              disabled={loading}
            />
          </label>

          <button 
            type="submit" 
            className="w-full rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form className="mt-10 space-y-6" onSubmit={handleOtpSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Verification Code</span>
            <input
              type="text"
              name="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              disabled={loading}
            />
          </label>

          <button 
            type="submit" 
            className="w-full rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Verifying code...' : 'Verify code'}
          </button>

          <button 
            type="button" 
            onClick={handleResendCode}
            className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Marketplace Kh? <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">Create account</Link>
      </p>
    </div>
  );
};

export default LoginPage;
