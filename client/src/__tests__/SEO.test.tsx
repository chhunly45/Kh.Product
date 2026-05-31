import { render, waitFor } from '@testing-library/react';
import SEO from '../components/SEO';

describe('SEO component', () => {
  it('updates document head metadata', async () => {
    render(
      <SEO
        title="Test Page"
        description="A test description"
        url="https://marketplace-kh.com/test"
        image="https://marketplace-kh.com/test-image.png"
        type="website"
      />
    );

    await waitFor(() => {
      expect(document.querySelector('meta[name="description"]')).toBeInTheDocument();
    });

    expect(document.title).toBe('Test Page | Marketplace Kh');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'A test description');
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Test Page | Marketplace Kh');
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute('content', 'https://marketplace-kh.com/test');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://marketplace-kh.com/test');
  });

  it('uses default metadata and structured data when no props are provided', async () => {
    render(<SEO />);

    await waitFor(() => {
      expect(document.querySelector('meta[name="description"]')).toBeInTheDocument();
    });

    expect(document.title).toBe('Marketplace Kh');
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    expect(document.querySelector('script[type="application/ld+json"][data-seo]')).toBeInTheDocument();

    const script = document.querySelector('script[type="application/ld+json"][data-seo]');
    expect(script).not.toBeNull();
    const json = script ? JSON.parse(script.textContent || '{}') : {};
    expect(json['@type']).toBe('WebSite');
    expect(json.publisher?.name).toBe('Marketplace Kh');
  });

  it('inserts custom structured data when provided', async () => {
    const customData = { '@context': 'https://schema.org', '@type': 'Product', name: 'Custom Product' };
    render(<SEO title="Custom" structuredData={customData} />);

    await waitFor(() => {
      expect(document.querySelector('script[type="application/ld+json"][data-seo]')).toBeInTheDocument();
    });

    const script = document.querySelector('script[type="application/ld+json"][data-seo]');
    expect(script).not.toBeNull();
    expect(script?.textContent).toContain('Custom Product');
  });
});
