import React from 'react';

interface SellerStatsProps {
  stats: any;
  memberSinceLabel: string;
}

const StatCard = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="rounded-[1.2rem] border border-white/15 bg-white/10 p-4 text-center shadow-[0_10px_28px_rgba(15,23,42,0.16)] backdrop-blur-sm">
    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-300">{title}</p>
    <p className="mt-2 text-lg font-semibold leading-tight text-white sm:text-xl">{value}</p>
  </div>
);

const SellerStats = ({ stats, memberSinceLabel }: SellerStatsProps) => {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:[&>*]:min-w-0">
      <StatCard title="Verified Seller" value="Verified" />
      <StatCard title="Products" value={stats?.totalProducts ?? 0} />
      <StatCard title="Profile Views" value={stats?.totalViews ?? 0} />
      <StatCard title="Member Since" value={memberSinceLabel} />
    </div>
  );
};

export default SellerStats;
