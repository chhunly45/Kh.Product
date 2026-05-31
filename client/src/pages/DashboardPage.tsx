const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <header className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold text-slate-900">Seller dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Overview of your listings, performance and activity.</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { label: 'Active listings', value: '24' },
          { label: 'Messages', value: '16' },
          { label: 'Favorites', value: '8' }
        ].map((stat) => (
          <article key={stat.label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{stat.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-600">
            <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">New message from Vichea about motorcycle listing.</li>
            <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">Product "Office Desk" marked as sold.</li>
          </ul>
        </article>

        <article className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-sky-500 hover:bg-slate-100">Create a new listing</button>
            <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:border-sky-500 hover:bg-slate-100">Review flagged messages</button>
          </div>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
