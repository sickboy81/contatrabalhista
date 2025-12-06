import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  schemas?: any[]; // Allow injection of extra schemas like HowTo
  ratingValue?: number; // E.g. 4.9
  reviewCount?: number; // E.g. 1250
  noIndex?: boolean; // Prevent indexing for 404 or utility pages
  isSoftware?: boolean; // If true, adds SoftwareApplication schema
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonical, image, schemas, ratingValue, reviewCount, noIndex, isSoftware = true }) => {
  const location = useLocation();
  const baseUrl = 'https://contatrabalhista.com.br';
  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/2534/2534204.png'; 

  // HashRouter Handling for Canonical
  // Google recommends clean URLs, but if using Hash, we point to the main app URL + Hash path
  let generatedUrl = '';
  if (location.pathname === '/') {
      generatedUrl = baseUrl + '/';
  } else {
      generatedUrl = `${baseUrl}/#${location.pathname}`;
  }

  const fullUrl = canonical ? canonical : generatedUrl;

  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | Conta Trabalhista`;

    // 2. Update Meta Tags
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', keywords || 'calculadora trabalhista, rescisão, clt, conta trabalhista, salário líquido');
    setMeta('author', 'Conta Trabalhista');

    // Handle Robots (Index/NoIndex)
    const setRobots = (content: string) => {
        let element = document.querySelector(`meta[name="robots"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('name', 'robots');
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    if (noIndex) {
        setRobots('noindex, nofollow');
    } else {
        setRobots('index, follow');
    }

    // 3. Open Graph (Social Media)
    const setOg = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setOg('og:title', title);
    setOg('og:description', description);
    setOg('og:url', fullUrl);
    setOg('og:type', 'website');
    setOg('og:image', image || defaultImage);
    setOg('og:locale', 'pt_BR');
    setOg('og:site_name', 'Conta Trabalhista');
    
    // Twitter Card
    const setTwitter = (name: string, content: string) => {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };
    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', title);
    setTwitter('twitter:description', description);
    setTwitter('twitter:image', image || defaultImage);


    // 4. Canonical Link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', fullUrl);

    // 5. Structured Data (JSON-LD)
    const allSchemas = [];

    // Base WebSite
    allSchemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Conta Trabalhista",
      "url": baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/#/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });

    // Organization Schema (E-E-A-T Signal)
    allSchemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Conta Trabalhista",
      "url": baseUrl,
      "logo": defaultImage,
      "sameAs": [
        "https://www.facebook.com/contatrabalhista",
        "https://instagram.com/contatrabalhista"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "contato@contatrabalhista.com.br"
      }
    });

    // SoftwareApplication Schema (Excellent for Calculators)
    if (isSoftware) {
        allSchemas.push({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": title,
            "description": description,
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript",
            "url": fullUrl,
            "image": image || defaultImage,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL"
            },
            "aggregateRating": ratingValue ? {
                "@type": "AggregateRating",
                "ratingValue": ratingValue.toString(),
                "ratingCount": reviewCount?.toString() || "100",
                "bestRating": "5",
                "worstRating": "1"
            } : undefined
        });
    }

    // Merge with page specific schemas
    if (schemas) {
        allSchemas.push(...schemas);
    }

    let script = document.querySelector('#seo-schema');
    if (!script) {
        script = document.createElement('script');
        script.id = 'seo-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(allSchemas);

  }, [title, description, keywords, fullUrl, image, schemas, ratingValue, reviewCount, noIndex, isSoftware]);

  return null;
};

export default SEO;