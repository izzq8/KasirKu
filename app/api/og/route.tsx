import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'KasirKu - Sistem Kasir Modern'
    const description = searchParams.get('description') || 'Sistem POS terbaik untuk UMKM Indonesia'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '40px',
              margin: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Shopping Cart Icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '30px',
                }}
              >
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginLeft: '20px',
                  }}
                >
                  KasirKu
                </span>
              </div>

              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '20px',
                  maxWidth: '900px',
                  lineHeight: '1.2',
                }}
              >
                {title}
              </h1>

              <p
                style={{
                  fontSize: '24px',
                  color: '#6b7280',
                  marginBottom: '30px',
                  maxWidth: '700px',
                  lineHeight: '1.4',
                }}
              >
                {description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: '600',
                  }}
                >
                  ✓ 100% Gratis
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: '600',
                  }}
                >
                  📱 Mobile Ready
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: '600',
                  }}
                >
                  🇮🇩 Made in Indonesia
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
