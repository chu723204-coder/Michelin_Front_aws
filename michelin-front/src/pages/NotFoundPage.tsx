import { useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{ fontFamily: "'Space Mono', monospace" }}
      className="min-h-screen bg-[#fdfdfd] flex flex-col"
    >
      {/* 상단 라인 */}
      <div className="w-full h-[2px] bg-[#111]" />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-[5vw] text-center">

        {/* 404 대형 텍스트 */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            lineHeight: 0.9,
            letterSpacing: '-4px',
            color: '#111',
            margin: 0,
          }}
        >
          4<span style={{ color: '#e62117' }}>0</span>4
        </h1>

        {/* 구분선 */}
        <div className="w-[60px] h-[1px] bg-[#ddd] my-8" />

        {/* 메시지 */}
        <p className="text-[10px] tracking-[4px] text-[#aaa] mb-2">
          PAGE NOT FOUND
        </p>
        <p className="text-[10px] tracking-[2px] text-[#ccc] mb-10">
          요청하신 페이지를 찾을 수 없습니다
        </p>

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            style={{ fontFamily: "'Space Mono', monospace" }}
            className="px-8 py-3 bg-[#111] text-white text-[10px] tracking-[3px]
                       border border-[#111] cursor-pointer
                       hover:bg-transparent hover:text-[#111] transition-all duration-300"
          >
            HOME
          </button>
          <button
            onClick={() => navigate('/restaurants')}
            style={{ fontFamily: "'Space Mono', monospace" }}
            className="px-8 py-3 bg-transparent text-[#111] text-[10px] tracking-[3px]
                       border border-[#111] cursor-pointer
                       hover:bg-[#111] hover:text-white transition-all duration-300"
          >
            RESTAURANTS →
          </button>
        </div>
      </div>

      {/* 하단 */}
      <div
        className="px-[5vw] py-5 flex justify-between items-center"
        style={{ borderTop: '0.5px solid #eee', background: '#f5f5f5' }}
      >
        <span className="text-[8px] tracking-[2px] text-[#ccc]">
          THE <span style={{ color: '#e62117' }}>PLATE</span>
        </span>
        <span className="text-[8px] tracking-[2px] text-[#ccc]">
          MICHELIN GUIDE 2026
        </span>
      </div>
    </div>
  )
}

export default NotFoundPage