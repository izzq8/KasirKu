# Production Environment Setup

## Environment Variables
```env
# Website Configuration
NEXT_PUBLIC_SITE_URL=https://kasirku.vercel.app
NEXT_PUBLIC_SITE_NAME="KasirKu"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX (optional)

# SEO
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id (optional)

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=@kasirku_id
NEXT_PUBLIC_FACEBOOK_PAGE=kasirku.official
```

## Domain Configuration Checklist
- [ ] Domain purchased and configured
- [ ] SSL certificate active
- [ ] CDN configured (Vercel automatic)
- [ ] Custom error pages working
- [ ] Redirects from www to non-www (or vice versa)

## DNS Records Setup
```
Type: A
Name: @
Value: 76.76.19.61 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Pre-Launch SEO Checklist
- [ ] All meta tags updated with real domain
- [ ] Open Graph images uploaded
- [ ] Sitemap accessible
- [ ] Robots.txt configured
- [ ] Google Search Console verified
- [ ] Google Analytics installed
- [ ] Schema markup validated
- [ ] Mobile-friendly test passed
- [ ] Page speed optimized
- [ ] Internal linking completed
