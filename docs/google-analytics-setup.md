# Google Analytics 4 Setup

## Step 1: Create GA4 Property
1. Buka https://analytics.google.com/
2. Create new property
3. Get Measurement ID (format: G-XXXXXXXXXX)

## Step 2: Install GA4 Code
Update layout.tsx dengan Google Analytics:

```typescript
import { GoogleAnalytics } from '@/components/analytics'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <StructuredData />
        <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Step 3: Test Implementation
1. Install Google Tag Assistant extension
2. Visit website and verify GA4 is firing
3. Check Real-time reports in GA4

## Step 4: Setup Goals & Events
Configure important events to track:
- Page views
- Product views
- Add to cart
- Transactions
- User registrations
