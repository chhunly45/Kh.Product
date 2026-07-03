import React from 'react';
import { Shield, MapPin, CalendarDays } from 'lucide-react';

interface SellerHeroProps {
  profile: any;
  avatarImage: string;
  coverImage: string;
  username: string;
  verificationStatusLabel: string;
  memberSinceLabel: string;
}

const SellerHero = ({ profile, avatarImage, coverImage, username, verificationStatusLabel, memberSinceLabel }: SellerHeroProps) => {
  return (
    <div className="relative overflow-hidden bg-text-primary">
      <div className="relative h-[15.5rem] overflow-hidden sm:h-[16.5rem]">
        <img
          src={coverImage}
          alt={profile?.displayName ? `${profile.displayName} cover` : 'Seller cover'}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-[#0f766e]/70 to-[#0f766e]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_35%)]" />
      </div>
      <div className="relative px-4 pb-5 sm:px-6 sm:pb-7 lg:px-8">
        <div className="-mt-[5.75rem] rounded-[2rem] bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex-shrink-0">
              <div className="relative h-[11rem] w-[11rem] overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                <img
                  src={avatarImage}
                  alt={profile?.displayName ? `${profile.displayName} avatar` : 'Seller avatar'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-600">
                <Shield className="h-4 w-4" /> {"ប្រវត្តិអ្នកលក់ / Seller Profile"}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{profile?.displayName || 'ឈ្មោះអ្នកលក់ / Seller Name'}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">{username}</span>
                {profile?.location && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <MapPin className="h-4 w-4" /> {profile.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                  <Shield className="h-4 w-4" /> {verificationStatusLabel}
                </span>
                {profile?.createdAt && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <CalendarDays className="h-4 w-4" /> {memberSinceLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHero;
