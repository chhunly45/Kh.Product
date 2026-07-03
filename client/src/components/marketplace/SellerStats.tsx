import React from 'react';

interface SellerStatsProps {
  stats: any;
  memberSinceLabel: string;
}

const StatCard = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between text-center">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">{title}</p>
    <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
  </div>
);

const SellerStats = ({ stats, memberSinceLabel }: SellerStatsProps) => {
  return (
    <div className="mt-4 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Product Count" value={stats.totalProducts} />
        <StatCard title="Profile Views" value={stats.totalViews} />
        <StatCard title="Favorites" value={stats.favoritesCount} />
        <StatCard title="Member Since" value={memberSinceLabel} />
      </div>
    </div>
  );
};

export default SellerStats;
