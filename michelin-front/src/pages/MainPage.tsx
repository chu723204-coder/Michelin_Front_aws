import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getRestaurantList } from '../service/restaurantApi'
import type { IRestaurantSummary } from '../types/IRestaurant'
import AdPopup from "../components/common/admin/AdPopup";

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1582450871972-ed5ca60b6f3d?w=400&q=70',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70',
  'https://images.unsplash.com/photo-1569058242252-62324e68884c?w=400&q=70',
  'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=70',
  'https://images.unsplash.com/photo-1547928576-a4a33237ce35?w=400&q=70',
  'https://images.unsplash.com/photo-1529692236671-f1f6e9482172?w=400&q=70',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=70',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=70',
]

// ✅ [1-1] 2스타/3스타 추가
const gradeLabel = (grade: string) => {
  if (grade === '3스타') return '★★★ 3 STARS'
  if (grade === '2스타') return '★★ 2 STARS'
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

// ✅ [1-2] gradeColor 함수 추가
const gradeColor = (grade: string) => {
  if (grade === '1스타' || grade === '2스타' || grade === '3스타') return '#DAA520'
  if (grade === '빕 구르망') return '#22C55E'
  return '#2563EB'
}

const FILTER_TAGS = [
  { label: '★ 1스타', query: '1스타' },
  { label: '빕 구르망', query: '빕 구르망' },
  { label: '부산', query: '부산' },
  { label: '서울', query: '서울' },
  { label: '한식', query: '한식' },
  { label: '일식', query: '일식' },
]

function MainPage() {
  const { introUnlocked, setIntroUnlocked } = useAuthStore()
  const [step, setStep] = useState<'intro' | 'unlocking' | 'unlocked'>(
    () => introUnlocked ? 'unlocked' : 'intro'
  )
  const [featured, setFeatured] = useState<IRestaurantSummary[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const navigate = useNavigate()
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleUnlock = () => {
    setStep('unlocking')
    setTimeout(() => { setStep('unlocked'); setIntroUnlocked() }, 1500)
  }

  const handleTagClick = (tag: { label: string; query: string }) => {
    setActiveTag(tag.query)
    navigate(`/restaurants?keyword=${tag.query}`)
  }

  useEffect(() => {
    if (step !== 'unlocked') return
    const fetchFeatured = async () => {
      try {
        const res = await getRestaurantList({ page: 0, size: 8 })
        setFeatured(res.data.data.content)
      } catch (e) { console.error(e) }
    }
    fetchFeatured()
  }, [step])

  useEffect(() => {
    if (step !== 'unlocked' || featured.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) }
        })
      },
      { threshold: 0.1 }
    )
    cardRefs.current.forEach(ref => { if (ref) observer.observe(ref) })
    return () => observer.disconnect()
  }, [step, featured])

  const getImage = (restaurant: IRestaurantSummary, index: number) => {
    return restaurant.mainImageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  }

  return (
    <>
      {/* 인트로 오버레이 */}
      {step !== 'unlocked' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={`absolute top-0 left-0 w-1/2 h-full bg-[#111] transition-transform duration-[1200ms] ease-in-out ${step === 'unlocking' ? '-translate-x-full' : ''}`} />
          <div className={`absolute top-0 right-0 w-1/2 h-full bg-[#111] transition-transform duration-[1200ms] ease-in-out ${step === 'unlocking' ? 'translate-x-full' : ''}`} />
          <div className={`relative z-[60] flex flex-col items-center text-white px-6 text-center transition-opacity duration-500 ${step === 'unlocking' ? 'opacity-0' : 'opacity-100'}`}>
            <p style={{ fontFamily: "'Space Mono', monospace" }} className="tracking-[6px] sm:tracking-[10px] text-xs mb-4 uppercase">TOP SECRET</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 10vw, 6rem)', color: '#e62117', letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>
              MICHELIN 2026
            </h2>
            <button
              onClick={handleUnlock}
              style={{ fontFamily: "'Space Mono', monospace" }}
              className="mt-10 border border-white text-white bg-transparent px-8 sm:px-12 py-4 text-xs tracking-[4px] sm:tracking-[6px] uppercase hover:bg-white hover:text-black transition-all duration-300 cursor-pointer w-full sm:w-auto"
            >
              DECODE & OPEN
            </button>
          </div>
        </div>
      )}

      {step === 'unlocked' && (
        <>
          {/* 매거진 스플릿 히어로 */}
          <header className="flex flex-col-reverse md:flex-row" style={{ borderBottom: '1px solid #eee' }}>
            <div
              className="w-full md:w-1/2"
              style={{ background: '#fdfdfd', padding: '52px 5vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', borderLeft: '0.5px solid #eee' }}
            >
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', letterSpacing: '3px', color: '#e62117', margin: 0 }}>
                MICHELIN GUIDE BUSAN · SEOUL 2026
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', color: '#111', letterSpacing: '-2px', margin: 0, lineHeight: 1.05 }}>
                Discover Your<br />Next Table
              </h1>
              <p style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.95rem', color: '#888', margin: 0, lineHeight: 1.6 }}>
                당신의 다음 맛집을 찾아보세요
              </p>
              <p style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.85rem', color: '#666', margin: 0, lineHeight: 1.8, borderLeft: '2px solid #e62117', paddingLeft: '14px' }}>
                부산과 서울, 미쉐린이 인정한 레스토랑들.<br />
                오랫동안 빛나지 않았던 골목의 진짜 맛집을<br />
                이 가이드에서 발견하세요.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/restaurants')}
                  style={{ background: '#111', border: '1px solid #111', padding: '14px 24px', color: '#fff', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px', cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e62117'; e.currentTarget.style.borderColor = '#e62117' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.borderColor = '#111' }}
                >
                  EXPLORE THE GUIDE →
                </button>
                <button
                  onClick={() => navigate('/map')}
                  style={{ background: 'transparent', border: '1px solid #111', padding: '14px 24px', color: '#111', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px', cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111' }}
                >
                  VIEW ON MAP →
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {FILTER_TAGS.map(tag => (
                  <button
                    key={tag.label}
                    onClick={() => handleTagClick(tag)}
                    style={{ background: activeTag === tag.query ? '#111' : '#fff', border: `0.5px solid ${activeTag === tag.query ? '#111' : '#ddd'}`, borderRadius: 0, padding: '5px 12px', color: activeTag === tag.query ? '#fff' : '#555', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (activeTag !== tag.query) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#111' } }}
                    onMouseLeave={e => { if (activeTag !== tag.query) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ddd' } }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/restaurants')}
                style={{ background: 'transparent', border: 'none', padding: 0, fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '2px', color: '#aaa', cursor: 'pointer', textAlign: 'left', width: 'fit-content' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
              >
                VIEW ALL RESTAURANTS →
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '2px', color: '#ccc' }}>SCROLL FOR FEATURED</span>
              </div>
            </div>

            <div className="w-full md:w-1/2" style={{ position: 'relative', overflow: 'hidden', minHeight: '40vh' }}>
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"
                alt="Michelin Restaurant"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
            </div>
          </header>

          {/* FEATURED 섹션 */}
          <section className="px-[5vw]" style={{ paddingTop: '60px', paddingBottom: '80px', background: '#fdfdfd' }}>
            <div className="flex justify-between items-center mb-10 sm:mb-[60px]">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: 0, color: '#111' }}>
                FEATURED
              </h2>
              <button
                onClick={() => navigate('/restaurants')}
                style={{ fontFamily: "'Space Mono', monospace" }}
                className="border border-[#111] text-[#111] bg-transparent px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs tracking-[3px] sm:tracking-[4px] uppercase hover:bg-[#111] hover:text-white transition-all duration-300 cursor-pointer whitespace-nowrap"
              >
                VIEW ALL →
              </button>
            </div>

            {featured.length === 0 ? (
              <div className="text-center py-16 text-[11px] tracking-[3px] text-[#aaa]" style={{ fontFamily: "'Space Mono', monospace" }}>
                LOADING...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[3px]">
                {featured.map((item, index) => (
                  <div
                    key={item.id}
                    ref={el => { cardRefs.current[index] = el }}
                    onClick={() => navigate(`/restaurants/${item.id}`)}
                    className="relative cursor-pointer overflow-hidden bg-[#1a1a1a] h-[260px] sm:h-[280px] lg:h-[280px]"
                    style={{ transitionDelay: `${index * 0.05}s` }}
                  >
                    <img
                      src={getImage(item, index)}
                      alt={item.restaurantName}
                      onError={e => { if (e.currentTarget.dataset.errored) return; e.currentTarget.dataset.errored = 'true'; e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] }}
                      className="w-full h-full object-cover block transition-all duration-300"
                      style={{ opacity: 0.85 }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* ✅ [3-1] 그린스타 우상단 아이콘 */}
                    {item.isGreenStar === 'Y' && (
                      <div
                        title="MICHELIN Green Star"
                        style={{ position: 'absolute', top: '14px', right: '14px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}
                      >
                        🌿
                      </div>
                    )}

                    <div className="absolute bottom-[14px] left-[14px] text-white">
                      {/* ✅ [1-3] gradeColor 적용 배지 */}
                      <div
                        className="text-[8px] tracking-[1.5px] px-[7px] py-[2px] inline-block mb-[5px]"
                        style={{ border: `1px solid ${gradeColor(item.grade)}`, color: gradeColor(item.grade) }}
                      >
                        {gradeLabel(item.grade)}
                      </div>
                      <div className="text-[13px] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {item.restaurantName}
                      </div>
                      {/* ✅ [2-2] 카테고리 + 지역 메타 */}
                      <div className="text-[9px] tracking-[1px] text-white/60 mt-[2px]" style={{ fontFamily: "'Space Mono', monospace" }}>
                        {item.category ? `${item.category.toUpperCase()} · ` : ''}{item.district}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <AdPopup />
        </>
      )}
    </>
  )
}

export default MainPage