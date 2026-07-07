import React from 'react';
import SellerContactCard from './SellerContactCard';
import { Edit3, Shield } from 'lucide-react';

interface SellerSidebarProps {
  profile: any;
  isOwner: boolean;
  completionPercentage: number;
  completionTone: string;
  completionChecks: any[];
  startEdit: () => void;
  setActiveTab: (tab: 'products' | 'about' | 'reviews') => void;
  profileUi: any;
  reviewSummary?: any;
}

const SellerSidebar = ({ profile, isOwner, completionPercentage, completionTone, completionChecks, startEdit, setActiveTab, profileUi }: SellerSidebarProps) => {
  return (
    <aside className="space-y-4 pt-4 lg:pt-0 lg:sticky lg:top-4">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-muted">{profileUi.storeCompletion}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{profileUi.completionHint}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Shield className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="text-sm font-medium text-slate-500">{completionChecks.filter((item) => item.complete).length}/{completionChecks.length} complete</div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-text-primary">{completionPercentage}%</p>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full bg-gradient-to-r ${completionTone}`} style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="grid gap-3">
          {isOwner && (
            <button
              type="button"
              onClick={startEdit}
              className="min-h-[42px] w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Edit3 className="mr-2 inline-block h-4 w-4" /> {profileUi.editProfile}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className="min-h-[42px] w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {profileUi.products}
          </button>
        </div>
      </div>

      <div>
        <SellerContactCard sellerName={profile?.displayName} sellerPhone={profile?.phoneNumber} sellerEmail={profile?.email} telegramHandle={profile?.telegram} />
      </div>
    </aside>
  );
};

export default SellerSidebar;
