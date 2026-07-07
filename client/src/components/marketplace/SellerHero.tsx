import React from 'react';
import { Shield, MapPin, CalendarDays } from 'lucide-react';
import SellerStats from './SellerStats';

interface SellerHeroProps {
  profile: any;
  avatarImage: string;
  coverImage: string;
  username: string;
  verificationStatusLabel: string;
  memberSinceLabel: string;
  stats?: any;
}

const SellerHero = ({ profile, avatarImage, coverImage, username, verificationStatusLabel, memberSinceLabel, stats }: SellerHeroProps) => {
  return (
    <div className="relative overflow-hidden bg-slate-950">
      <div className="relative h-[12.5rem] overflow-hidden sm:h-[14rem] lg:h-[15.5rem]">
        <img
          src={coverImage}
          alt={profile?.displayName ? `${profile.displayName} cover` : 'Seller cover'}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-emerald-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%)]" />
      </div>
      <div className="relative px-4 pb-5 sm:px-6 sm:pb-7 lg:px-8">
        <div className="-mt-[4.5rem] rounded-[1.4rem] bg-slate-950/70 p-5 text-white shadow-[0_20px_48px_rgba(15,23,42,0.24)] backdrop-blur-xl lg:-mt-[5.75rem] lg:px-7 lg:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex-shrink-0 self-start lg:self-auto">
              <div className="relative h-[8rem] w-[8rem] overflow-hidden rounded-full border-[4px] border-white/90 bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.24)] sm:h-[9rem] sm:w-[9rem] lg:h-[12rem] lg:w-[12rem] lg:border-[5px]">
                <img
                  src={avatarImage}
                  alt={profile?.displayName ? `${profile.displayName} avatar` : 'Seller avatar'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1" role="group" aria-label="seller identity">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-100">
                <Shield className="h-4 w-4" /> {"ប្រវត្តិអ្នកលក់ / Seller Profile"}
              </div>
              <div className="mt-3 flex flex-col gap-3 lg:gap-3">
                <div className="min-w-0">
                  <h1 className="whitespace-nowrap text-[1.9rem] font-semibold tracking-tight text-white sm:text-[2.1rem] lg:text-[2.5rem]">
                    {profile?.displayName || 'ឈ្មោះអ្នកលក់ / Seller Name'}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-slate-200">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">{username}</span>
                    {profile?.location && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                        <MapPin className="h-4 w-4" /> {profile.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                      <Shield className="h-4 w-4" /> {verificationStatusLabel}
                    </span>
                    {profile?.createdAt && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                        <CalendarDays className="h-4 w-4" /> {memberSinceLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <SellerStats stats={stats} memberSinceLabel={memberSinceLabel} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHero;
