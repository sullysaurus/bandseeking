import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'BandSeeking'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '12px solid black',
            padding: '60px 80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '12px 12px 0px rgba(0,0,0,1)',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: '-4px',
              marginBottom: '20px',
            }}
          >
            BANDSEEKING
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Connect with Musicians
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}