import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Join the marketplace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Create your free seller account</h1>
        <p className="text-sm text-slate-500">Register to post products, manage messages, and grow your audience.</p>
      </div>

      <form className="mt-10 space-y-6">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full Name</span>
          <input type="text" placeholder="Sophea" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input type="email" placeholder="you@example.com" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input type="password" placeholder="Create a password" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        </label>

        <button type="submit" className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
