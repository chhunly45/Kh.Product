import React, { useEffect, useState } from 'react';
import { getActiveBanners } from '../../services/banner.api';

interface TopAdBannerProps {
  imageUrl?: string;
  link?: string;
}

const TopAdBanner = ({ imageUrl, link }: TopAdBannerProps) => {
  const [banner, setBanner] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    getActiveBanners('top')
      .then((res) => {
        if (!mounted) return;
        const items = res.data || [];
        setBanner(items.length ? items[0] : null);
      })
      .catch(() => {
        // ignore and keep placeholder
      });
    return () => {
      mounted = false;
    };
  }, []);

  const renderArtwork = (src?: string, alt?: string) => {
    if (src) {
      return (
        <div style={{ paddingTop: '25%' }} className="w-full relative bg-background">
          <img
            src={src}
            alt={alt || 'ad'}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div style={{ paddingTop: '25%' }} className="w-full relative bg-background flex items-center justify-center">
        <div className="text-muted">Ad image</div>
      </div>
    );
  };

  const renderWrapper = (children: React.ReactNode) => {
    const href = banner?.linkUrl || link;
    const label = banner?.title ? `Promotional banner: ${banner.title}` : 'Promotional banner';

    if (href) {
      return (
        <a href={href} aria-label={label} className="block">
          {children}
        </a>
      );
    }

    return <div>{children}</div>;
  };

  const display = (
    <div className="rounded-2xl overflow-hidden border border-muted bg-white shadow-sm">
      <div className="relative">
        {renderWrapper(renderArtwork(banner?.imageUrl || imageUrl, banner?.title || 'ad'))}
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {display}
    </section>
  );
};

export default TopAdBanner;

