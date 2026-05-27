import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRestaurantList } from '../../service/restaurantApi'
// ✅ interface 제거 → IRestaurant import
import type { IRestaurant } from '../../types/IRestaurant'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1582450871972-ed5ca60b6f3d?w=600',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
  'https://images.unsplash.com/photo-1569058242252-62324e68884c?w=600',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600',
  'https://images.unsplash.com/photo-1547928576-a4a33237ce35?w=600',
  'https://images.unsplash.com/photo-1529692236671-f1f6e9482172?w=600',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600',
]

const gradeLabel = (grade: string) => {
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

// ✅ Restaurant → IRestaurant
const getImage = (restaurant: IRestaurant, index: number) =>
  restaurant.mainImageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
  if (e.currentTarget.dataset.errored) return
  e.currentTarget.dataset.errored = 'true'
  e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
}

const imgStyle: React.CSSProperties = {
  width: '100%', height: '100%', objectFit: 'cover',
  opacity: 0.7, filter: 'grayscale(1)', display: 'block', transition: '0.3s'
}
const overlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)'
}
const gradeTagStyle: React.CSSProperties = {
  fontSize: '8px', letterSpacing: '1.5px',
  border: '1px solid #e62117', color: '#e62117',
  padding: '2px 8px', display: 'inline-block', marginBottom: '6px'
}

const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0 }
    100% { background-position:  600px 0 }
  }
  .skeleton {
    background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }
`

function SkeletonBlock({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius: 0, ...style }} />
}

function ListPageSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '3px', marginBottom: '3px' }}>
        <SkeletonBlock style={{ height: isMobile ? '240px' : '320px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gridTemplateRows: isMobile ? '1fr' : '1fr 1fr', gap: '3px', height: isMobile ? '160px' : '320px' }}>
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '3px' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonBlock key={i} style={{ height: isMobile ? '160px' : '200px' }} />
        ))}
      </div>
    </>
  )
}

function RestaurantListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // ✅ Restaurant[] → IRestaurant[]
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [filters, setFilters] = useState({ grade: '', city: '', isGreenStar: '' })

  const keyword = searchParams.get('keyword') || ''
  const SIZE = 12

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { setPage(0) }, [keyword])

  useEffect(() => { fetchList() }, [page, filters, keyword])

  const fetchList = async () => {
    try {
      setLoading(true)
      const params: any = { page, size: SIZE }
      if (filters.grade) params.grade = filters.grade
      if (filters.city) params.city = filters.city
      if (filters.isGreenStar) params.isGreenStar = filters.isGreenStar
      if (keyword) params.keyword = keyword
      const res = await getRestaurantList(params)
      setRestaurants(res.data.data.content)
      setTotalCount(res.data.data.totalElements)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key as keyof typeof prev] === value ? '' : value }))
    setPage(0)
  }

  const clearKeyword = () => {
    setSearchParams({})
    setPage(0)
  }

  const totalPages = Math.ceil(totalCount / SIZE)
  const featured = restaurants.slice(0, 3)
  const rest = restaurants.slice(3)

  const pageCount = isMobile ? 3 : 5
  const pageGroupStart = Math.floor(page / pageCount) * pageCount
  const pageNumbers = Array.from(
    { length: Math.min(pageCount, totalPages - pageGroupStart) },
    (_, i) => pageGroupStart + i
  )

  return (
    <>
      <style>{shimmerStyle}</style>

      <div style={{ fontFamily: "'Space Mono', monospace", background: '#fdfdfd', minHeight: '100vh', padding: '2rem 5vw' }}>

        {keyword && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#111', marginBottom: '1rem' }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#fff' }}>
              SEARCH · <span style={{ color: '#e62117' }}>{keyword}</span>
              <span style={{ color: '#aaa', marginLeft: '8px' }}>{loading ? '' : `${totalCount}건`}</span>
            </div>
            <button onClick={clearKeyword} style={{ fontSize: '10px', letterSpacing: '1px', color: '#aaa', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              ✕ 초기화
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '2px', marginRight: '4px' }}>GRADE</span>
          {['', '1스타', '빕 구르망', '선정 레스토랑'].map((g, i) => (
            <button key={i} onClick={() => handleFilter('grade', g)} style={{ fontSize: '10px', padding: '4px 10px', border: `0.5px solid ${filters.grade === g ? '#111' : '#ddd'}`, background: filters.grade === g ? '#111' : 'transparent', color: filters.grade === g ? '#fff' : '#888', cursor: 'pointer', letterSpacing: '1px' }}>
              {g === '' ? 'ALL' : gradeLabel(g)}
            </button>
          ))}
          {isMobile && <div style={{ width: '100%' }} />}
          <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '2px', marginRight: '4px' }}>REGION</span>
          {['', '부산', '서울'].map((c, i) => (
            <button key={i} onClick={() => handleFilter('city', c)} style={{ fontSize: '10px', padding: '4px 10px', border: `0.5px solid ${filters.city === c ? '#111' : '#ddd'}`, background: filters.city === c ? '#111' : 'transparent', color: filters.city === c ? '#fff' : '#888', cursor: 'pointer', letterSpacing: '1px' }}>
              {c === '' ? '전체' : c}
            </button>
          ))}
          <button onClick={() => handleFilter('isGreenStar', 'Y')} style={{ fontSize: '10px', padding: '4px 10px', border: `0.5px solid ${filters.isGreenStar === 'Y' ? '#2d7a2d' : '#ddd'}`, background: filters.isGreenStar === 'Y' ? '#2d7a2d' : 'transparent', color: filters.isGreenStar === 'Y' ? '#fff' : '#888', cursor: 'pointer', letterSpacing: '1px' }}>
            🌿 GREEN STAR
          </button>
          {!isMobile && (
            <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '1px', marginLeft: 'auto' }}>
              {loading ? '—' : totalCount} RESULTS
            </span>
          )}
        </div>

        {isMobile && (
          <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '1px', marginBottom: '1rem' }}>
            {loading ? '—' : totalCount} RESULTS
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#aaa', marginBottom: '1rem' }}>NO RESULTS</div>
            {keyword && (
              <button onClick={clearKeyword} style={{ fontSize: '10px', letterSpacing: '2px', padding: '8px 20px', border: '0.5px solid #111', background: 'transparent', cursor: 'pointer', color: '#111' }}>
                전체 목록 보기
              </button>
            )}
          </div>
        )}

        {loading ? (
          <ListPageSkeleton isMobile={isMobile} />
        ) : (
          <>
            {featured.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '3px', marginBottom: '3px' }}>
                <div onClick={() => navigate(`/restaurants/${featured[0].id}`)} style={{ position: 'relative', height: isMobile ? '240px' : '320px', overflow: 'hidden', background: '#1a1a1a', cursor: 'pointer' }}>
                  <img src={getImage(featured[0], 0)} alt={featured[0].restaurantName} style={imgStyle} onError={e => handleImgError(e, 0)} onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '0.9' }} onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }} />
                  <div style={overlayStyle} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff' }}>
                    <div style={gradeTagStyle}>{gradeLabel(featured[0].grade)}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '16px' : '20px', fontWeight: 500 }}>{featured[0].restaurantName}</div>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{featured[0].district}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gridTemplateRows: isMobile ? '1fr' : '1fr 1fr', gap: '3px', height: isMobile ? '160px' : '320px' }}>
                  {featured.slice(1, 3).map((r, i) => (
                    <div key={r.id} onClick={() => navigate(`/restaurants/${r.id}`)} style={{ position: 'relative', overflow: 'hidden', background: '#1a1a1a', cursor: 'pointer' }}>
                      <img src={getImage(r, i + 1)} alt={r.restaurantName} style={imgStyle} onError={e => handleImgError(e, i + 1)} onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '0.9' }} onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }} />
                      <div style={overlayStyle} />
                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#fff' }}>
                        <div style={{ ...gradeTagStyle, fontSize: '8px', padding: '2px 7px' }}>{gradeLabel(r.grade)}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '12px', fontWeight: 500 }}>{r.restaurantName}</div>
                        <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{r.district}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '3px', marginBottom: '3px' }}>
                {rest.map((r, i) => (
                  <div key={r.id} onClick={() => navigate(`/restaurants/${r.id}`)} style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', background: '#1a1a1a', height: isMobile ? '160px' : '200px' }}>
                    <img src={getImage(r, i + 3)} alt={r.restaurantName} style={imgStyle} onError={e => handleImgError(e, i + 3)} onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.opacity = '0.9' }} onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1)'; e.currentTarget.style.opacity = '0.7' }} />
                    <div style={{ ...overlayStyle, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff' }}>
                      <div style={{ ...gradeTagStyle, fontSize: '7px', padding: '2px 6px', marginBottom: '3px' }}>{gradeLabel(r.grade)}</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '11px' : '12px', fontWeight: 500 }}>{r.restaurantName}</div>
                      <div style={{ fontSize: '8px', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{r.district}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '3rem' }}>
              <button onClick={() => setPage(0)} disabled={page === 0} style={{ width: '28px', height: '28px', border: '0.5px solid #ddd', background: 'transparent', color: page === 0 ? '#ddd' : '#888', cursor: page === 0 ? 'default' : 'pointer', fontSize: '11px' }}>«</button>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ width: '28px', height: '28px', border: '0.5px solid #ddd', background: 'transparent', color: page === 0 ? '#ddd' : '#888', cursor: page === 0 ? 'default' : 'pointer', fontSize: '12px' }}>‹</button>
              {pageNumbers.map(i => (
                <button key={i} onClick={() => setPage(i)} style={{ width: '28px', height: '28px', border: `0.5px solid ${page === i ? '#111' : '#ddd'}`, background: page === i ? '#111' : 'transparent', color: page === i ? '#fff' : '#888', cursor: 'pointer', fontSize: '11px' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ width: '28px', height: '28px', border: '0.5px solid #ddd', background: 'transparent', color: page === totalPages - 1 ? '#ddd' : '#888', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: '12px' }}>›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} style={{ width: '28px', height: '28px', border: '0.5px solid #ddd', background: 'transparent', color: page === totalPages - 1 ? '#ddd' : '#888', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: '11px' }}>»</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default RestaurantListPage