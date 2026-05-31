import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Welcome back</p>
        <h1 className="text-3xl font-semibold text-slate-900">Log in to your account</h1>
        <p className="text-sm text-slate-500">Enter your email and password to manage listings, chat, and favorites.</p>
      </div>

      <form className="mt-10 space-y-6">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input type="email" placeholder="you@example.com" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input type="password" placeholder="********" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        </label>

        <button type="submit" className="w-full rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Marketplace Kh? <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">Create account</Link>
      </p>
    </div>
  );
};

export default LoginPage;
