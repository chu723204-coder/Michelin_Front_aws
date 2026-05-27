import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useLangStore } from '../../store/useLangStore'
import { getSearchAutocomplete } from '../../service/restaurantApi'
import { Bell, Shield } from 'lucide-react'

interface AutocompleteItem {
  id: number
  restaurantName: string
  grade: string
  district: string
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedIn, logout, introUnlocked, setActiveModal, memberGrade } = useAuthStore()
  const { lang, setLang } = useLangStore()

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<AutocompleteItem[]>([])
  const [focused, setFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isAdmin = memberGrade === 'ADMIN'
  const isLoggedIn = loggedIn

  const gradeLabel = (grade: string) => {
    if (grade === '1스타') return '★ 1 STAR'
    if (grade === '빕 구르망') return 'BIB GOURMAND'
    return 'SELECTED'
  }

  const fetchAutocomplete = useCallback(async (value: string) => {
    if (value.trim().length < 1) { setResults([]); return }
    try {
      const res = await getSearchAutocomplete(value)
      setResults(res.data.data || [])
    } catch { setResults([]) }
  }, [])

  const handleKeyword = (value: string) => {
    setKeyword(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (value.trim().length < 1) { setResults([]); return }
    debounceTimer.current = setTimeout(() => { fetchAutocomplete(value) }, 300)
  }

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [])

  const handleSelect = (id: number) => {
    setKeyword(''); setResults([]); setFocused(false)
    setMobileSearchOpen(false); setMobileMenuOpen(false)
    navigate(`/restaurants/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyword.trim()) {
      navigate(`/restaurants?keyword=${keyword}`)
      setKeyword(''); setResults([]); setFocused(false)
      setMobileSearchOpen(false); setMobileMenuOpen(false)
    }
  }

  const toggleMenu = () => {
    setMobileMenuOpen(prev => { if (!prev) setMobileSearchOpen(false); return !prev })
  }

  const toggleSearch = () => {
    setMobileSearchOpen(prev => { if (!prev) setMobileMenuOpen(false); return !prev })
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFocused(false); setResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); inputRef.current?.focus(); setFocused(true)
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => { setMobileMenuOpen(false); setMobileSearchOpen(false) }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => { if (mobileMenuOpen) setMobileMenuOpen(false) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  const isIntro = location.pathname === '/' && !introUnlocked
  if (isIntro) return null

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fdfdfd', borderBottom: '1px solid #ddd' }}>
        <div className="relative flex items-center justify-between px-[5vw]" style={{ height: '56px' }}>

          {/* 로고 + 검색창 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div
              onClick={() => navigate('/')}
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-1px', cursor: 'pointer', color: '#111', flexShrink: 0 }}
            >
              THE <span style={{ color: '#e62117' }}>MICHELIN</span>
            </div>

            {/* 검색창 - pill 형태 */}
            <div ref={dropdownRef} className="hidden md:block" style={{ position: 'relative', width: '280px', zIndex: 200 }}>
              <div
                className="flex items-center gap-2"
                style={{ border: `1px solid ${focused ? '#111' : '#e0e0e0'}`, padding: '6px 14px', transition: 'border-color 0.2s', background: '#fff', borderRadius: '999px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={focused ? '#111' : '#aaa'} strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef} type="text" value={keyword}
                  onChange={e => handleKeyword(e.target.value)} onFocus={() => setFocused(true)}
                  onKeyDown={handleKeyDown} placeholder="맛집 검색"
                  style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.78rem', color: '#333', background: 'transparent', border: 'none', outline: 'none', flex: 1, width: '100%' }}
                />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: '#ccc', userSelect: 'none', letterSpacing: '1px', flexShrink: 0 }}>⌘K</span>
              </div>
              {focused && results.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fdfdfd', border: '1px solid #ddd', borderRadius: '12px', maxHeight: '280px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {results.map((item, i) => (
                    <div key={item.id} onClick={() => handleSelect(item.id)}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '0.5px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: i === 0 ? '12px 12px 0 0' : i === results.length - 1 ? '0 0 12px 12px' : '0' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '13px', color: '#111' }}>{item.restaurantName}</div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '1px', marginTop: '2px' }}>{item.district}</div>
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#e62117', letterSpacing: '1px', border: '0.5px solid #e62117', padding: '1px 6px' }}>
                        {gradeLabel(item.grade)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {focused && keyword.length > 0 && results.length === 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fdfdfd', border: '1px solid #ddd', borderRadius: '12px', padding: '14px', textAlign: 'center', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#aaa', letterSpacing: '2px' }}>
                  검색 결과 없음
                </div>
              )}
            </div>
          </div>

          {/* 데스크탑 우측 메뉴 */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-6" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.82rem' }}>
              <span onClick={() => navigate('/restaurants')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>맛집</span>
              <span onClick={() => navigate('/map')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>지도</span>
              <span onClick={() => navigate('/notices')} className="cursor-pointer" style={{ color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>공지사항</span>
            </div>

            {/* ✅ KO|EN 토글 - 활성 언어 박스 형태 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '1px' }}>
              <span
                onClick={() => setLang('ko')}
                style={{ cursor: 'pointer', color: lang === 'ko' ? '#e62117' : '#bbb', fontWeight: lang === 'ko' ? 'bold' : 'normal', border: lang === 'ko' ? '1px solid #e62117' : '1px solid transparent', padding: '2px 5px', transition: 'all 0.2s' }}
              >KO</span>
              <span style={{ color: '#ddd' }}>|</span>
              <span
                onClick={() => setLang('en')}
                style={{ cursor: 'pointer', color: lang === 'en' ? '#e62117' : '#bbb', fontWeight: lang === 'en' ? 'bold' : 'normal', border: lang === 'en' ? '1px solid #e62117' : '1px solid transparent', padding: '2px 5px', transition: 'all 0.2s' }}
              >EN</span>
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn && (
                <button
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', position: 'relative', color: '#111' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'} title="알림"
                >
                  <Bell size={18} strokeWidth={1.5} />
                  <span style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', background: '#e62117', borderRadius: '50%' }} />
                </button>
              )}
              {isAdmin && (
                <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'} title="관리자">
                  <Shield size={18} strokeWidth={1.5} />
                </button>
              )}
              {isLoggedIn ? (
                <>
                  <span onClick={() => navigate('/mypage')} style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.82rem', cursor: 'pointer', color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>마이페이지</span>
                  <span style={{ color: '#ddd', fontSize: '0.75rem' }}>|</span>
                  <span onClick={logout} style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.82rem', cursor: 'pointer', color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>로그아웃</span>
                </>
              ) : (
                <>
                  <span onClick={() => setActiveModal('LOGIN')} style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.82rem', cursor: 'pointer', color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>로그인</span>
                  <span style={{ color: '#ddd', fontSize: '0.75rem' }}>|</span>
                  <span onClick={() => setActiveModal('JOIN')} style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.82rem', cursor: 'pointer', color: '#111' }} onMouseEnter={e => e.currentTarget.style.color = '#e62117'} onMouseLeave={e => e.currentTarget.style.color = '#111'}>회원가입</span>
                </>
              )}
            </div>
          </div>

          {/* 모바일 우측 아이콘 */}
          <div className="flex md:hidden items-center gap-4">
            <button onClick={toggleSearch} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>🔍</button>
            <button onClick={toggleMenu} aria-label="메뉴" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', width: '28px', height: '28px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ position: 'absolute', display: 'block', width: '20px', transition: 'opacity 0.2s', opacity: mobileMenuOpen ? 0 : 1 }}>
                <span style={{ display: 'block', width: '20px', height: '1.5px', background: '#111', marginBottom: '5px' }} />
                <span style={{ display: 'block', width: '20px', height: '1.5px', background: '#111', marginBottom: '5px' }} />
                <span style={{ display: 'block', width: '20px', height: '1.5px', background: '#111' }} />
              </span>
              <span style={{ position: 'absolute', fontSize: '18px', color: '#111', lineHeight: 1, transition: 'opacity 0.2s', opacity: mobileMenuOpen ? 1 : 0, userSelect: 'none' }}>✕</span>
            </button>
          </div>
        </div>

        {/* 모바일 검색창 */}
        {mobileSearchOpen && (
          <div className="md:hidden" style={{ padding: '10px 5vw', borderTop: '0.5px solid #eee', background: '#fdfdfd' }}>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div className="flex items-center gap-3" style={{ border: '1px solid #111', padding: '8px 14px', background: '#fff', borderRadius: '999px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text" value={keyword} onChange={e => handleKeyword(e.target.value)}
                  onFocus={() => setFocused(true)} onKeyDown={handleKeyDown} placeholder="맛집 검색" autoFocus
                  style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.85rem', color: '#333', background: 'transparent', border: 'none', outline: 'none', flex: 1 }}
                />
              </div>
              {focused && results.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fdfdfd', border: '1px solid #ddd', borderRadius: '12px', maxHeight: '240px', overflowY: 'auto', zIndex: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {results.map((item, i) => (
                    <div key={item.id} onClick={() => handleSelect(item.id)}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '0.5px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '13px', color: '#111' }}>{item.restaurantName}</div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', marginTop: '2px' }}>{item.district}</div>
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#e62117', border: '0.5px solid #e62117', padding: '1px 6px' }}>{gradeLabel(item.grade)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 딤 오버레이 */}
      <div
        className="md:hidden fixed inset-0 bg-black/40 z-[110] transition-opacity duration-300"
        style={{ opacity: mobileMenuOpen ? 1 : 0, pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* 모바일 사이드바 */}
      <div
        className="md:hidden fixed top-0 right-0 h-full bg-[#fdfdfd] z-[120] flex flex-col"
        style={{ width: 'min(75vw, 280px)', transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: mobileMenuOpen ? '-4px 0 24px rgba(0,0,0,0.12)' : 'none' }}
      >
        <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '0.5px solid #eee', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1rem', letterSpacing: '-1px', color: '#111' }}>
            THE <span style={{ color: '#e62117' }}>MICHELIN</span>
          </span>
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#111', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
          <div style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.9rem' }}>
            <div onClick={() => navigate('/restaurants')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>맛집 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
            <div onClick={() => navigate('/map')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>지도 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
            <div onClick={() => navigate('/notices')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>공지사항 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
            {isLoggedIn && (
              <div onClick={() => navigate('/mypage')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>마이페이지 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
            )}
            {isAdmin && (
              <div onClick={() => navigate('/admin')} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>관리자 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
            )}
            {isLoggedIn ? (
              <div onClick={logout} style={{ padding: '16px 24px', cursor: 'pointer', color: '#e62117' }} onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>로그아웃</div>
            ) : (
              <>
                <div onClick={() => { setActiveModal('LOGIN'); setMobileMenuOpen(false) }} style={{ padding: '16px 24px', borderBottom: '0.5px solid #eee', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>로그인 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
                <div onClick={() => { setActiveModal('JOIN'); setMobileMenuOpen(false) }} style={{ padding: '16px 24px', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>회원가입 <span style={{ color: '#ccc', fontSize: '10px' }}>→</span></div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '0.5px solid #eee', flexShrink: 0 }}>
          {/* ✅ 모바일 사이드바 KO|EN도 박스 형태 통일 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '2px' }}>
            <span onClick={() => setLang('ko')} style={{ cursor: 'pointer', color: lang === 'ko' ? '#e62117' : '#bbb', fontWeight: lang === 'ko' ? 'bold' : 'normal', border: lang === 'ko' ? '1px solid #e62117' : '1px solid transparent', padding: '2px 5px', transition: 'all 0.2s' }}>KO</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span onClick={() => setLang('en')} style={{ cursor: 'pointer', color: lang === 'en' ? '#e62117' : '#bbb', fontWeight: lang === 'en' ? 'bold' : 'normal', border: lang === 'en' ? '1px solid #e62117' : '1px solid transparent', padding: '2px 5px', transition: 'all 0.2s' }}>EN</span>
          </div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '2px', color: '#ccc', margin: 0 }}>MICHELIN GUIDE 2026</p>
        </div>
      </div>
    </>
  )
}

export default Navbar