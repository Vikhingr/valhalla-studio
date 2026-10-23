import { ImageResponse } from 'next/og'

export const alt = 'Valhalla Studio — Diseño y desarrollo web · Ciudad de México'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#efece4',
          position: 'relative',
        }}
      >
        {/* Marco dibujado */}
        <div
          style={{
            position: 'absolute',
            inset: 32,
            border: '2.5px solid rgba(42,42,46,0.25)',
            borderRadius: 6,
            display: 'flex',
          }}
        />

        {/* Contenido central */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* Logo V */}
          <div
            style={{
              width: 88,
              height: 88,
              border: '3px solid #2a2a2e',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 700,
              color: '#2a5bd7',
              fontFamily: 'serif',
              marginBottom: 28,
            }}
          >
            V
          </div>

          {/* Título */}
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: '#2a2a2e',
              fontFamily: 'serif',
              letterSpacing: -1,
              marginBottom: 18,
            }}
          >
            Valhalla Studio
          </div>

          {/* Línea azul */}
          <div
            style={{
              width: 260,
              height: 3,
              backgroundColor: '#2a5bd7',
              borderRadius: 2,
              marginBottom: 20,
            }}
          />

          {/* Subtítulo */}
          <div
            style={{
              fontSize: 28,
              color: '#6d6b70',
              fontFamily: 'sans-serif',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Diseño y desarrollo web · CDMX
          </div>
        </div>

        {/* URL abajo */}
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            fontSize: 20,
            color: '#6d6b70',
            fontFamily: 'monospace',
            letterSpacing: 1,
          }}
        >
          valhallastudio.com.mx
        </div>
      </div>
    ),
    size
  )
}
