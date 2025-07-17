import Script from 'next/script'

export function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KasirKu",
    "url": "https://kasirku.vercel.app",
    "logo": "https://kasirku.vercel.app/logo.png",
    "description": "Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": "Indonesian"
    },
    "sameAs": [
      "https://github.com/izzq8/KasirKu"
    ]
  }

  const softwareApplicationData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KasirKu",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia. Kelola inventori, laporan penjualan, dan transaksi dengan mudah.",
    "featureList": [
      "Manajemen Inventori",
      "Laporan Penjualan",
      "Transaksi Cepat",
      "Multi-Platform",
      "Responsive Design",
      "Real-time Updates"
    ],
    "screenshot": "https://kasirku.vercel.app/screenshot.jpg",
    "softwareVersion": "1.0.0",
    "datePublished": "2024-01-01",
    "dateModified": "2024-12-01",
    "author": {
      "@type": "Organization",
      "name": "KasirKu Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "KasirKu",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kasirku.vercel.app/logo.png"
      }
    }
  }

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KasirKu",
    "url": "https://kasirku.vercel.app",
    "description": "Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia",
    "publisher": {
      "@type": "Organization",
      "name": "KasirKu"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://kasirku.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kasirku.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dashboard",
        "item": "https://kasirku.vercel.app/dashboard"
      }
    ]
  }

  return (
    <>
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <Script
        id="software-application-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationData) }}
      />
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  )
}
