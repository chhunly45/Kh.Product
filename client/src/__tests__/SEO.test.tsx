import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SEO, { getMetaUrl, getViteEnv } from '../components/SEO';

const renderWithHelmet = (ui: ReactElement) => {
  return render(<HelmetProvider>{ui}</HelmetProvider>);
};

describe('SEO component', () => {
  it('updates document head metadata', async () => {
    renderWithHelmet(
      <SEO
        title="Test Page"
        description="A test description"
        url="https://konpuk.com/test"
        image="https://konpuk.com/test-image.png"
        type="website"
      />
    );

    await waitFor(() => {
      expect(document.querySelector('meta[name="description"]')).toBeInTheDocument();
    });

    expect(document.title).toBe('Test Page | Konpuk');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'A test description');
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Test Page | Konpuk');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://konpuk.com/test');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    expect(document.querySelector('meta[name="twitter:url"]')).toHaveAttribute('content', 'https://konpuk.com/test');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://konpuk.com/test');
  });

  it('supports custom robots directives', async () => {
    renderWithHelmet(<SEO title="Noindex Page" robots="noindex" url="https://konpuk.com/noindex" />);

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toBeInTheDocument();
    });

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://konpuk.com/noindex');
  });

  it('uses default metadata when no props are provided', async () => {
    renderWithHelmet(<SEO />);

    await waitFor(() => {
      expect(document.querySelector('meta[name="description"]')).toBeInTheDocument();
    });

    expect(document.title).toBe('Konpuk');
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeInTheDocument();
  });

  it('inserts custom structured data when provided', async () => {
    const customData = { '@context': 'https://schema.org', '@type': 'Product', name: 'Custom Product' };
    renderWithHelmet(<SEO title="Custom" structuredData={customData} />);

    await waitFor(() => {
      expect(document.querySelector('script[type="application/ld+json"]')).toBeInTheDocument();
    });

    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.textContent).toContain('Custom Product');
  });

  it('derives default image from VITE_SITE_URL when no image prop is provided', async () => {
    process.env.VITE_SITE_URL = 'https://custom.example';
    jest.resetModules();

    const [{ HelmetProvider: LocalHelmetProvider }, { default: SEOWithEnv }] = await Promise.all([
      import('react-helmet-async'),
      import('../components/SEO')
    ]);

    render(<LocalHelmetProvider>
      <SEOWithEnv />
    </LocalHelmetProvider>);

    await waitFor(() => {
      expect(document.querySelector('meta[property="og:image"]')).toBeInTheDocument();
    });

    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://custom.example/logo.png');

    delete process.env.VITE_SITE_URL;
  });

  it('uses window location as default URL when no url is provided', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'https://example.com/fallback',
        pathname: '/fallback',
        search: '',
        origin: 'https://example.com'
      }
    });

    renderWithHelmet(<SEO />);

    await waitFor(() => {
      expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://example.com/fallback');
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  it('returns fallback site URL when window is unavailable and url prop is missing', () => {
    const result = getMetaUrl(undefined, undefined);
    expect(result).toBe('https://konpuk.com');
  });

  it('returns VITE_SITE_URL value when env contains it and fallback is missing', () => {
    const result = getViteEnv('VITE_SITE_URL', 'https://konpuk.com', { VITE_SITE_URL: 'https://custom.example' });
    expect(result).toBe('https://custom.example');
  });

  it('falls back to provided default when VITE_SITE_URL is unavailable', () => {
    const result = getViteEnv('VITE_SITE_URL', 'https://konpuk.com', {});
    expect(result).toBe('https://konpuk.com');
  });
});
