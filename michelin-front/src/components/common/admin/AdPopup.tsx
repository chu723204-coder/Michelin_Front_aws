import React, { useEffect, useState } from "react";
import { popupService, type PopupAdResponse } from "../../../service/popupService";

const AdPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activePopup, setActivePopup] = useState<PopupAdResponse | null>(null);
  const [hideForDay, setHideForDay] = useState<boolean>(false);

  useEffect(() => {
    const isHidePopup = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hideMichelinAd="));

    if (!isHidePopup) {
      const fetchActivePopupAd = async () => {
        try {
          const data = await popupService.getActivePopup();
          if (data) {
            setActivePopup(data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error("활성 팝업 광고 데이터 로드 실패", error);
        }
      };
      fetchActivePopupAd();
    }
  }, []);

  const handleClose = () => {
    if (hideForDay) {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      document.cookie = `hideMichelinAd=true; expires=${midnight.toUTCString()}; path=/; SameSite=Lax;`;
    }
    setIsOpen(false);
  };

  if (!isOpen || !activePopup) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
      }}
    >
      <div style={{ width: '320px', background: '#fdfdfd', border: '1px solid #222', overflow: 'hidden' }}>

        {/* 상단 헤더 */}
        <div style={{ background: '#111', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '3px', color: '#aaa' }}>
            SPONSORED
          </span>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '14px', lineHeight: '1', padding: '0' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
          >
            ✕
          </button>
        </div>

        {/* 광고 이미지 */}
        <a href={activePopup.landingUrl || '#'} style={{ display: 'block', width: '100%', height: '200px', overflow: 'hidden' }}>
          <img
            src={activePopup.imageUrl}
            alt={activePopup.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.2)', transition: 'filter 0.3s, transform 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
          />
        </a>

        {/* 타이틀 */}
        <div style={{ padding: '12px 14px 8px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>
            {activePopup.title}
          </p>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 12px', borderTop: '0.5px solid #eee' }}>

          {/* ✅ 체크박스 */}
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}
          >
            <div
              onClick={() => setHideForDay(prev => !prev)}
              style={{
                width: '14px',
                height: '14px',
                border: `1px solid ${hideForDay ? '#111' : '#ccc'}`,
                background: hideForDay ? '#111' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {hideForDay && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span
              onClick={() => setHideForDay(prev => !prev)}
              style={{ fontSize: '11px', color: '#888', userSelect: 'none' }}
            >
              오늘 하루 보지 않기
            </span>
          </label>

          <button
            onClick={handleClose}
            style={{ background: '#111', border: 'none', fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: '#fff', padding: '6px 14px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e62117')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdPopup;