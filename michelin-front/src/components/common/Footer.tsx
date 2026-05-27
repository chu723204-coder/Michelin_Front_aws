import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()

  return (
    <footer
      style={{
        borderTop: '1px solid #eee',
        background: '#fdfdfd',
        fontFamily: "'Space Mono', monospace"
      }}
    >
      <div
        className="px-[5vw] pt-[40px] pb-[32px]"
      >
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: '1.8rem',
            letterSpacing: '-2px',
            color: '#111',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          THE <span style={{ color: '#e62117' }}>MICHELIN</span>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-end">
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '2px',
              color: '#aaa',
              lineHeight: 1.8,
              margin: 0
            }}
          >
            MICHELIN GUIDE BUSAN · SEOUL 2026<br />
            CURATED RESTAURANT ARCHIVE
          </p>
          <div className="flex gap-6" style={{ fontSize: '0.65rem', letterSpacing: '2px' }}>
            <span
              onClick={() => navigate('/restaurants')}
              className="cursor-pointer"
              style={{ color: '#888' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              RESTAURANTS
            </span>
            <span
              onClick={() => navigate('/map')}
              className="cursor-pointer"
              style={{ color: '#888' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e62117'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              MAP
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer