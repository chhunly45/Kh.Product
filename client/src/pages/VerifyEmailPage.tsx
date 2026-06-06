import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyEmailCode, resendEmailVerificationCode } from '../services/auth.api';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('identifier') || '';
    setIdentifier(id);
  }, [location.search]);

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

  const buildIdentifier = (input: string) => {
    const normalized = input.trim();
    if (normalized.includes('@')) return normalized.toLowerCase();
    return `${normalized.replace(/\D/g, '') || 'user'}@marketplace.kh`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    try {
      if (!identifier.trim()) {
        setError('Email or phone is required');
        return;
      }
      if (!otpCode.trim() || otpCode.trim().length !== 6) {
        setError('Please enter the 6-digit verification code.');
        return;
      }

      await verifyEmailCode({
        identifier: buildIdentifier(identifier),
        code: otpCode.trim()
      });

      setStatus('Email verified successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setStatus('');
    setLoading(true);

    try {
      const response = await resendEmailVerificationCode({ identifier: buildIdentifier(identifier) });
      setStatus('A fresh verification code was sent to your email.');
      setResendCooldown(response.resendCooldownSeconds || 60);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to resend verification code.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 shadow-2xl ring-1 ring-slate-200">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Verify your email</p>
          <h1 className="text-3xl font-semibold text-slate-900">Confirm your account</h1>
          <p className="text-sm text-slate-500">Enter the code sent to your email to finish registration.</p>
        </div>

        {status && (
          <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email or Phone</span>
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Enter email or phone number"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              disabled={loading}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Verification Code</span>
            <input
              type="text"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
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
            {loading ? 'Verifying...' : 'Verify email'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already verified? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
