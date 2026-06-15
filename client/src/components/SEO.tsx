import { useEffect } from 'react';

const getViteEnv = (key: string, fallback: string) => {
  const env = safeImportMetaEnv();
  const value = env[key];
  return value || fallback;
};

const safeImportMetaEnv = () => {
  try {
    return eval('import.meta.env') as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

const defaultSiteUrl = getViteEnv('VITE_SITE_URL', 'https://konpuk.com');
const defaultImage = `${defaultSiteUrl}/logo.png`;

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  robots?: string;
  structuredData?: Record<string, any>;
}

const setMeta = (selector: string, attr: string, value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    const match = selector.match(/\[(name|property)="([^\"]+)"\]/);
    if (match) {
      element.setAttribute(match[1], match[2]);
    } else {
      element.setAttribute(attr, selector.includes('property') ? 'property' : 'name');
    }
    document.head.appendChild(element);
  }
  element.content = value;
};

const setLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

const insertStructuredData = (structuredData: Record<string, any>) => {
  if (!structuredData) return;
  let script = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-seo]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'true';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(structuredData);
};

const SEO = ({ title, description, url, image, type = 'website', structuredData, robots = 'index, follow' }: SEOProps) => {
  useEffect(() => {
    const pageTitle = title ? `${title} | Konpuk` : 'Konpuk';
    document.title = pageTitle;

    setMeta('meta[name="description"]', 'name', description || 'Cambodian marketplace for buyers and sellers.');
    setMeta('meta[name="keywords"]', 'name', 'Cambodia marketplace, buy sell, local classifieds, Khmer products');
    setMeta('meta[name="robots"]', 'name', robots);
    setMeta('meta[property="og:title"]', 'property', pageTitle);
    setMeta('meta[property="og:description"]', 'property', description || 'Cambodian marketplace for buyers and sellers.');
    setMeta('meta[property="og:type"]', 'property', type);
    setMeta('meta[property="og:url"]', 'property', url || window.location.href);
    setMeta('meta[property="og:image"]', 'property', image || defaultImage);
    setMeta('meta[property="og:site_name"]', 'property', 'Konpuk');
    setMeta('meta[name="twitter:card"]', 'name', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', pageTitle);
    setMeta('meta[name="twitter:description"]', 'name', description || 'Cambodian marketplace for buyers and sellers.');
    setMeta('meta[name="twitter:image"]', 'name', image || defaultImage);
    setMeta('meta[name="twitter:url"]', 'name', url || window.location.href);
    setLink('canonical', url || window.location.href);

    const siteJsonLd = structuredData || {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Konpuk',
      url: url || defaultSiteUrl,
      description: description || 'Cambodian marketplace for buyers and sellers.',
      publisher: {
        '@type': 'Organization',
        name: 'Konpuk',
        url: defaultSiteUrl
      }
    };

    insertStructuredData(siteJsonLd);
  }, [title, description, url, image, type, robots, structuredData]);

  return null;
};

export default SEO;
