import React from 'react';

interface TopAdBannerProps {
  imageUrl?: string;
  link?: string;
}

const TopAdBanner = ({ imageUrl, link }: TopAdBannerProps) => {
  const Content = (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-4 p-4 sm:p-6">
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt="ad" className="hidden md:block w-48 h-20 object-cover rounded-md" />
          ) : (
            <div className="hidden md:flex w-48 h-20 bg-slate-100 rounded-md items-center justify-center text-slate-400">Ad image</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Advertise with Konpuk</h3>
          <p className="text-sm text-slate-600 truncate">Promote your products to thousands of local buyers</p>
        </div>

        <div className="flex-shrink-0">
          <a
            href={link || '/contact'}
            className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-700 transition text-sm"
            aria-label="Contact us about advertising"
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {Content}
    </section>
  );
};

export default TopAdBanner;
