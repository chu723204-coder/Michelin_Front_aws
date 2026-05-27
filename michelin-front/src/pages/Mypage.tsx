import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const MOCK_USER = {
  name: '홍길동',
  email: 'hong@email.com',
  reviewCount: 12,
  likeCount: 8,
  bookmarkCount: 5,
  visitCount: 3,
}

const MOCK_STATS = [
  { label: '3 STAR', grade: '3스타', visited: 1, total: 5, color: '#DAA520', borderColor: '#DAA520' },
  { label: '2 STAR', grade: '2스타', visited: 0, total: 8, color: '#DAA520', borderColor: '#DAA520' },
  { label: '1 STAR', grade: '1스타', visited: 2, total: 32, color: '#DAA520', borderColor: '#DAA520' },
  { label: 'BIB', grade: '빕 구르망', visited: 0, total: 45, color: '#22C55E', borderColor: '#22C55E' },
  { label: 'GREEN', grade: '그린스타', visited: 0, total: 12, color: '#2d7a2d', borderColor: '#2d7a2d' },
]

const MOCK_REVIEWS = [
  { id: 1, restaurantName: '라연', rating: 5, content: '분위기도 좋고 음식도 훌륭했습니다.', date: '2026.05.10' },
  { id: 2, restaurantName: '밍글스', rating: 4, content: '코스 요리가 인상적이었어요.', date: '2026.04.22' },
  { id: 3, restaurantName: '정식당', rating: 5, content: '역시 미쉐린 스타 레스토랑답습니다.', date: '2026.03.15' },
]

const MOCK_LIKES = [
  { id: 1, restaurantName: '가온', district: '강남구', grade: '2스타' },
  { id: 2, restaurantName: '권숙수', district: '종로구', grade: '2스타' },
  { id: 3, restaurantName: '스와니예', district: '용산구', grade: '1스타' },
]

const MOCK_BOOKMARKS = [
  { id: 1, restaurantName: '가온', district: '강남구', grade: '2스타' },
  { id: 2, restaurantName: '정식당', district: '강남구', grade: '2스타' },
]

const gradeColor = (grade: string) => {
  if (['1스타', '2스타', '3스타'].includes(grade)) return '#DAA520'
  if (grade === '빕 구르망') return '#22C55E'
  return '#2563EB'
}

const gradeLabel = (grade: string) => {
  if (grade === '3스타') return '★★★ 3 STARS'
  if (grade === '2스타') return '★★ 2 STARS'
  if (grade === '1스타') return '★ 1 STAR'
  if (grade === '빕 구르망') return 'BIB GOURMAND'
  return 'SELECTED'
}

const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

type TabType = 'reviews' | 'likes' | 'bookmarks'

function MyPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('reviews')

  const tabStyle = (tab: TabType) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    letterSpacing: '2px',
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
    color: activeTab === tab ? '#111' : '#aaa',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fdfdfd' }}>

      {/* ✅ 헤더 - 공지사항 B안 통일 */}
      <div style={{ borderBottom: '1px solid #ddd', padding: '20px 5vw 16px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '4px', color: '#e62117', margin: '0 0 8px' }}>
            ● THE MICHELIN
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#111', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            마이 페이지
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ height: '0.5px', background: '#ddd', width: '60px' }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '2px', color: '#aaa' }}>
              MY ACCOUNT &amp; ACTIVITY
            </span>
            <div style={{ height: '0.5px', background: '#ddd', width: '60px' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 5vw 4rem' }}>

        {/* ✅ 프로필 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid #eee' }}>
          <div style={{ width: '52px', height: '52px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>
            {MOCK_USER.name[0]}
          </div>
          <div>
            <p style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '15px', fontWeight: 600, margin: 0, color: '#111' }}>{MOCK_USER.name}</p>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#aaa', margin: '4px 0 0', letterSpacing: '1px' }}>{MOCK_USER.email}</p>
          </div>
          <button
            style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1.5px', padding: '7px 14px', border: '0.5px solid #ddd', background: 'transparent', cursor: 'pointer', color: '#111', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111' }}
          >
            프로필 수정
          </button>
        </div>

        {/* ✅ 통계 카드 - 각진 스타일 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', marginBottom: '2rem' }}>
          {[
            { label: 'REVIEWS', value: MOCK_USER.reviewCount },
            { label: 'LIKES', value: MOCK_USER.likeCount },
            { label: 'BOOKMARKS', value: MOCK_USER.bookmarkCount },
            { label: 'VISITS', value: MOCK_USER.visitCount },
          ].map((item) => (
            <div key={item.label} style={{ background: '#f8f8f8', padding: '1.2rem 1rem', textAlign: 'center', border: '0.5px solid #eee' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, margin: 0, color: '#111' }}>{item.value}</p>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#aaa', margin: '6px 0 0', letterSpacing: '2px' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* ✅ 미쉐린 스탯 - 각진 스타일 + gradeColor 통일 */}
        <div style={{ border: '0.5px solid #eee', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: '#aaa', margin: '0 0 1rem' }}>MICHELIN STATS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {MOCK_STATS.map((stat) => (
              <div key={stat.grade} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: stat.color, border: `0.5px solid ${stat.borderColor}`, padding: '2px 6px', letterSpacing: '1px' }}>
                    {stat.label}
                  </span>
                  <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '13px', color: '#111' }}>{stat.grade}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '100px', height: '2px', background: '#f0f0f0', overflow: 'hidden' }}>
                    <div style={{ width: `${(stat.visited / stat.total) * 100}%`, height: '100%', background: stat.color }} />
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#aaa', minWidth: '44px', textAlign: 'right' }}>
                    {stat.visited} / {stat.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ borderBottom: '0.5px solid #eee', marginBottom: '1.5rem', display: 'flex' }}>
          <button style={tabStyle('reviews')} onClick={() => setActiveTab('reviews')}>REVIEWS</button>
          <button style={tabStyle('likes')} onClick={() => setActiveTab('likes')}>LIKES</button>
          <button style={tabStyle('bookmarks')} onClick={() => setActiveTab('bookmarks')}>BOOKMARKS</button>
        </div>

        {/* 리뷰 탭 */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MOCK_REVIEWS.map((review, i) => (
              <div key={review.id} style={{ padding: '18px 0', borderBottom: i < MOCK_REVIEWS.length - 1 ? '0.5px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700, color: '#111', cursor: 'pointer' }}
                        onClick={() => navigate(`/restaurants/${review.id}`)}
                        onMouseEnter={e => (e.currentTarget.style.color = '#e62117')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#111')}
                      >
                        {review.restaurantName}
                      </span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#DAA520', letterSpacing: '1px' }}>
                        {renderStars(review.rating)}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.7 }}>
                      {review.content}
                    </p>
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', flexShrink: 0, marginLeft: '16px', letterSpacing: '0.5px' }}>
                    {review.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 좋아요 탭 */}
        {activeTab === 'likes' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MOCK_LIKES.map((item, i) => (
              <div
                key={item.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < MOCK_LIKES.length - 1 ? '0.5px solid #f0f0f0' : 'none', cursor: 'pointer' }}
                onClick={() => navigate(`/restaurants/${item.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700, margin: 0, color: '#111' }}>{item.restaurantName}</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', margin: '4px 0 0', letterSpacing: '1px' }}>{item.district}</p>
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: gradeColor(item.grade), border: `0.5px solid ${gradeColor(item.grade)}`, padding: '2px 6px', letterSpacing: '1px' }}>
                  {gradeLabel(item.grade)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 북마크 탭 */}
        {activeTab === 'bookmarks' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MOCK_BOOKMARKS.map((item, i) => (
              <div
                key={item.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < MOCK_BOOKMARKS.length - 1 ? '0.5px solid #f0f0f0' : 'none', cursor: 'pointer' }}
                onClick={() => navigate(`/restaurants/${item.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700, margin: 0, color: '#111' }}>{item.restaurantName}</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaa', margin: '4px 0 0', letterSpacing: '1px' }}>{item.district}</p>
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: gradeColor(item.grade), border: `0.5px solid ${gradeColor(item.grade)}`, padding: '2px 6px', letterSpacing: '1px' }}>
                  {gradeLabel(item.grade)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ✅ ACCOUNT - 각진 스타일 */}
        <div style={{ border: '0.5px solid #eee', padding: '1.25rem', marginTop: '2rem' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: '#aaa', margin: '0 0 1rem' }}>ACCOUNT</p>
          {[
            { label: '비밀번호 변경', onClick: () => {}, danger: false },
            { label: '로그아웃', onClick: logout, danger: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '0.5px solid #eee', cursor: 'pointer' }}
              onClick={item.onClick}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '13px', color: '#111' }}>{item.label}</span>
              <span style={{ color: '#ccc', fontSize: '12px' }}>→</span>
            </div>
          ))}
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '13px', color: '#e62117' }}>회원 탈퇴</span>
            <span style={{ color: '#e62117', fontSize: '12px' }}>→</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default MyPage