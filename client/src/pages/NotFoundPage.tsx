import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-6 rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Page not found</p>
        <h1 className="text-4xl font-semibold text-slate-900">404 — Nothing here</h1>
        <p className="text-sm text-slate-500">The page you are looking for may have moved or no longer exists.</p>
        <Link to="/" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Return home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
