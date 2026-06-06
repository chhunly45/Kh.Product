import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword, resendPasswordResetCode } from '../services/auth.api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const buildIdentifier = (input: string) => {
    const normalized = input.trim();
    if (normalized.includes('@')) return normalized.toLowerCase();
    return `${normalized.replace(/\D/g, '') || 'user'}@marketplace.kh`;
  };

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    try {
      if (!identifier.trim()) {
        setError('Email or phone is required');
        return;
      }

      const payload = { identifier: buildIdentifier(identifier) };
      const result = await requestPasswordReset(payload);
      setStatus('Password reset code sent to your email.');
      setResendCooldown(result.resendCooldownSeconds || 60);
      setStage('reset');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to request password reset.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
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
        setError('Please enter the 6-digit reset code.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      await resetPassword({
        identifier: buildIdentifier(identifier),
        code: otpCode.trim(),
        password
      });

      setStatus('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to reset password.';
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
      const result = await resendPasswordResetCode({ identifier: buildIdentifier(identifier) });
      setStatus('A fresh reset code was sent to your email.');
      setResendCooldown(result.resendCooldownSeconds || 60);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to resend reset code.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 shadow-2xl ring-1 ring-slate-200">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Forgot password</p>
          <h1 className="text-3xl font-semibold text-slate-900">Reset your password</h1>
          <p className="text-sm text-slate-500">Enter your email or phone to receive a reset code and set a new password.</p>
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

        {stage === 'request' ? (
          <form className="mt-10 space-y-6" onSubmit={handleRequest}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email or Phone</span>
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Email or phone"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Sending code...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form className="mt-10 space-y-6" onSubmit={handleReset}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email or Phone</span>
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Email or phone"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Reset Code</span>
              <input
                type="text"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                disabled={loading}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">New Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  disabled={loading}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  disabled={loading}
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend reset code'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
