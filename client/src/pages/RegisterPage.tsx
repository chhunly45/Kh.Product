import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth.api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: ''
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
      if (!formData.displayName.trim()) {
        setError('Full name is required');
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      await register(formData);
      // Registration successful, redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Join the marketplace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Create your free seller account</h1>
        <p className="text-sm text-slate-500">Register to post products, manage messages, and grow your audience.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full Name</span>
          <input 
            type="text" 
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Sophea" 
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" 
            disabled={loading}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com" 
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
            placeholder="Create a password" 
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" 
            disabled={loading}
          />
        </label>

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
  );
};

export default RegisterPage;
