import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { NoticeService, type NoticeResponseDto } from '../service/NoticeService';

const CATEGORY_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  NOTICE: { label: 'NOTICE', color: '#111', bg: '#f0f0f0' },
  UPDATE: { label: 'UPDATE', color: '#fff', bg: '#111' },
  EVENT:  { label: 'EVENT',  color: '#fff', bg: '#e62117' },
}

function NoticesPage() {
  const [openId, setOpenId] = useState<number | null>(null)
  const [notices, setNotices] = useState<NoticeResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchNotices = async (page: number) => {
    setLoading(true)
    try {
      const res = await NoticeService.getCustomerNotices(page)
      setNotices(res.data ?? [])
      setTotalPages(res.totalPages ?? 0)
    } catch (error) {
      console.error('공지사항 로드 실패', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotices(currentPage) }, [currentPage])

  const pinned = notices.filter(n => n.fixYn === 'Y')
  const regular = notices.filter(n => n.fixYn !== 'Y')
  const toggle = (id: number) => setOpenId(prev => prev === id ? null : id)

  const renderItem = (notice: NoticeResponseDto) => {
    const isPinned = notice.fixYn === 'Y'
    const cat = CATEGORY_STYLE[notice.category ?? 'NOTICE'] ?? CATEGORY_STYLE.NOTICE
    const isOpen = openId === notice.noticeId

    return (
      <div key={notice.noticeId} style={{ borderBottom: '0.5px solid #e8e8e8' }}>
        <div
          onClick={() => toggle(notice.noticeId)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ width: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPinned && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#e62117" stroke="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            )}
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1.5px', color: cat.color, background: cat.bg, padding: '3px 8px', flexShrink: 0 }}>
            {cat.label}
          </span>
          <span style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.88rem', fontWeight: 500, color: '#111', flex: 1, lineHeight: 1.5 }}>
            {notice.title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#aaa', letterSpacing: '1px' }}>
              {notice.formattedDate}
            </span>
            <ChevronDown
              size={14}
              color="#aaa"
              style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
            />
          </div>
        </div>
        <div style={{ overflow: 'hidden', maxHeight: isOpen ? '600px' : '0', transition: 'max-height 0.35s ease' }}>
          <div style={{ paddingBottom: '24px', paddingLeft: '40px' }}>
            <div style={{ borderLeft: '2px solid #e62117', paddingLeft: '20px' }}>
              {notice.content.split('\n').map((line, i) => (
                <p key={i} style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: '0.85rem', color: line.startsWith('•') ? '#444' : '#666', lineHeight: 1.9, margin: line === '' ? '8px 0' : '0' }}>
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fdfdfd' }}>

      {/* ✅ 헤더 padding 축소 */}
      <div style={{ borderBottom: '1px solid #ddd', padding: '20px 5vw 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', letterSpacing: '4px', color: '#e62117', margin: '0 0 8px' }}>
            ● THE MICHELIN
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#111', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            공지사항
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div style={{ height: '0.5px', background: '#ddd', width: '60px' }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '2px', color: '#aaa' }}>
              SERVICE UPDATES &amp; ANNOUNCEMENTS
            </span>
            <div style={{ height: '0.5px', background: '#ddd', width: '60px' }} />
          </div>
        </div>
      </div>

      {/* ✅ 본문 maxWidth 통일 */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5vw 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#aaa', letterSpacing: '3px' }}>
            LOADING...
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '3px', color: '#aaa', margin: '0 0 8px' }}>
                  PINNED
                </p>
                <div style={{ background: '#fafafa', border: '0.5px solid #e8e8e8', padding: '0 20px' }}>
                  {pinned.map(renderItem)}
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '3px', color: '#aaa', margin: '0 0 8px' }}>
                ALL NOTICES — {notices.length} ITEMS
              </p>
              <div>{regular.map(renderItem)}</div>
            </div>

            {/* ✅ 페이지네이션 중앙 정렬 수정 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '60px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', padding: '6px 12px', cursor: 'pointer', border: 'none', background: currentPage === page ? '#111' : 'transparent', color: currentPage === page ? '#fff' : '#aaa', transition: '0.2s' }}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default NoticesPage