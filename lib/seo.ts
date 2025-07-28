import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  noIndex?: boolean
  noFollow?: boolean
}

export function generateSEO({
  title = 'KasirKu - Sistem Kasir Modern',
  description = 'Sistem kasir modern dan POS terbaik untuk UMKM, toko, warung, dan bisnis retail di Indonesia',
  keywords = [],
  canonical,
  ogImage = '/og-image.jpg',
  noIndex = false,
  noFollow = false,
}: SEOProps = {}): Metadata {
  const baseUrl = 'https://kasirku.vercel.app' // Ganti dengan URL sebenarnya
  
  const defaultKeywords = [
    'sistem kasir',
    'POS system',
    'kasir online',
    'aplikasi kasir',
    'sistem point of sale',
    'kasir UMKM',
    'software kasir',
    'aplikasi toko',
    'manajemen inventori',
    'laporan penjualan',
    'kasir modern',
    'POS Indonesia',
  ]

  const allKeywords = [...defaultKeywords, ...keywords]

  return {
    title,
    description,
    keywords: allKeywords,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'id_ID',
      url: canonical || baseUrl,
      siteName: 'KasirKu',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@kasirku_id',
    },
    alternates: {
      canonical: canonical || baseUrl,
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  author,
  url,
  image,
}: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  author: string
  url: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KasirKu',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kasirku.vercel.app/logo.png',
      },
    },
    url,
    image: image || 'https://kasirku.vercel.app/og-image.jpg',
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateHowToSchema({
  name,
  description,
  steps,
}: {
  name: string
  description: string
  steps: { name: string; text: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

export function generateLocalBusinessSchema({
  name,
  address,
  phone,
  email,
  url,
  priceRange,
}: {
  name: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  phone: string
  email: string
  url: string
  priceRange: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    telephone: phone,
    email,
    url,
    priceRange,
    openingHours: [
      'Mo-Su 00:00-23:59', // 24/7 karena aplikasi online
    ],
  }
}
