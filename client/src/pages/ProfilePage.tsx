const ProfilePage = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-slate-100" />
          <div>
            <p className="text-xl font-semibold text-slate-900">Sopheak</p>
            <p className="text-sm text-slate-500">Seller in Phnom Penh</p>
          </div>
        </div>

        <div className="mt-8 space-y-4 text-sm text-slate-600">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Active listings</p>
            <p className="mt-2">12 items</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Favorites</p>
            <p className="mt-2">4 saved products</p>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">Profile settings</h1>
          <p className="mt-3 text-sm text-slate-500">Manage your account information, contact details, and seller profile.</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Display name</span>
              <input type="text" value="Sopheak" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" readOnly />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input type="email" value="sophea@example.com" className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" readOnly />
            </label>
          </div>

          <label className="block mt-6">
            <span className="text-sm font-medium text-slate-700">About</span>
            <textarea value="Experienced seller handling vehicles and electronics across Phnom Penh." rows={4} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" readOnly />
          </label>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
