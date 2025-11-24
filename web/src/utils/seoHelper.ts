/**
 * SEO Helper Utilities
 * Provides structured data, meta tag management, and SEO optimization
 */

interface StructuredDataProduct {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  offers?: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
}

interface StructuredDataOrganization {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface StructuredDataWebSite {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

/**
 * Adds JSON-LD structured data to the page
 */
export function addStructuredData(data: StructuredDataProduct | StructuredDataOrganization | StructuredDataWebSite | any): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Initializes SEO structured data for Kwami
 */
export function initKwamiSEO(): void {
  // Organization schema
  const organizationData: StructuredDataOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kwami',
    url: 'https://kwami.io',
    logo: 'https://kwami.io/icon-512.png',
    description: 'Interactive 3D AI Companion framework with Mind, Body, and Soul architecture',
    sameAs: [
      'https://github.com/alexcolls/kwami',
      'https://twitter.com/kwami_io',
      'https://discord.gg/kwami'
    ]
  };

  // Website schema
  const websiteData: StructuredDataWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kwami - Interactive 3D AI Companion',
    url: 'https://kwami.io'
  };

  // SoftwareApplication schema
  const softwareData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kwami',
    operatingSystem: 'Web Browser',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127'
    }
  };

  addStructuredData(organizationData);
  addStructuredData(websiteData);
  addStructuredData(softwareData);

  console.log('✅ SEO structured data initialized');
}

/**
 * Updates page title dynamically
 */
export function updatePageTitle(title: string): void {
  document.title = title;
  
  // Update OG title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }
  
  // Update Twitter title
  let twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title);
  }
}

/**
 * Updates page description dynamically
 */
export function updatePageDescription(description: string): void {
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
  
  // Update OG description
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }
  
  // Update Twitter description
  let twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', description);
  }
}

/**
 * Adds hreflang tags for multi-language support
 */
export function addHreflangTags(languages: Array<{ code: string; url: string }>): void {
  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(tag => tag.remove());
  
  languages.forEach(({ code, url }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = code;
    link.href = url;
    document.head.appendChild(link);
  });
  
  // Add x-default
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = languages.find(l => l.code === 'en')?.url || languages[0].url;
  document.head.appendChild(defaultLink);
}

/**
 * Generates sitemap data (to be used server-side or build-time)
 */
export function generateSitemapData() {
  const sections = Array.from({ length: 22 }, (_, i) => ({
    url: `https://kwami.io/#section-${i}`,
    priority: i === 0 ? '1.0' : '0.8',
    changefreq: 'weekly'
  }));
  
  return [
    {
      url: 'https://kwami.io',
      priority: '1.0',
      changefreq: 'daily'
    },
    {
      url: 'https://pg.kwami.io',
      priority: '0.9',
      changefreq: 'weekly'
    },
    {
      url: 'https://candy.kwami.io',
      priority: '0.8',
      changefreq: 'weekly'
    },
    ...sections
  ];
}

/**
 * Adds breadcrumb structured data
 */
export function addBreadcrumbs(items: Array<{ name: string; url: string }>): void {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
  
  addStructuredData(breadcrumbData);
}

/**
 * Updates canonical URL
 */
export function updateCanonicalURL(url: string): void {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', url);
  } else {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    document.head.appendChild(canonical);
  }
}

/**
 * Preloads critical resources
 */
export function preloadCriticalResources(): void {
  const resources = [
    { href: '/icon-192.png', as: 'image' },
    { href: '/icon-512.png', as: 'image' },
    { href: '/og-image.png', as: 'image' }
  ];
  
  resources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
}

/**
 * Tracks Core Web Vitals and reports to analytics
 */
export async function trackCoreWebVitals(): Promise<void> {
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');
    
    const sendToAnalytics = (metric: any) => {
      // Send to your analytics endpoint
      console.log('📊 Core Web Vital:', metric.name, metric.value);
      
      // If you have Google Analytics
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true
        });
      }
    };
    
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // FID is replaced by INP in web-vitals v4
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (error) {
    console.warn('Could not load web-vitals:', error);
  }
}

