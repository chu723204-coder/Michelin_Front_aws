import { useState, useRef, useEffect } from 'react'
import { useT } from '../../hooks/useT'
import api from '../../service/api'

interface Message {
  role: 'user' | 'bot'
  text: string
}

function ChatbotWidget() {
  const { t } = useT()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const userText = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setIsLoading(true)
    try {
      const res = await api.post('/chatbot/chat', { message: userText, sessionId })
      if (res.data.data.sessionId) setSessionId(res.data.data.sessionId)
      setMessages(prev => [...prev, { role: 'bot', text: res.data.data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: t('chat_error') }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* 채팅 패널 */}
      <div
        style={{
          position: 'fixed', bottom: '80px', right: '20px', zIndex: 500,
          width: '360px', height: '500px', background: '#fdfdfd', border: '1px solid #ddd',
          boxShadow: '0 8px 32px rgba(0,0,0,0.13)', display: 'flex', flexDirection: 'column',
          fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
          transformOrigin: 'bottom right',
        }}
      >
        {/* 헤더 */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #222', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '3px', color: '#e62117', margin: '0 0 3px' }}>● MICHELIN GUIDE</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{t('chat_title')}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, padding: '10px 12px', background: '#f7f7f7', border: '0.5px solid #eee', whiteSpace: 'pre-line' }}>
            {t('chat_greeting')}
          </div>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '82%', padding: '10px 13px', fontSize: '13px', lineHeight: 1.55, background: msg.role === 'user' ? '#111' : '#f4f4f4', color: msg.role === 'user' ? '#fff' : '#111', border: msg.role === 'bot' ? '0.5px solid #e8e8e8' : 'none', wordBreak: 'break-word' }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '10px 14px', background: '#f4f4f4', border: '0.5px solid #e8e8e8', fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '3px', color: '#bbb' }}>· · ·</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <div style={{ borderTop: '1px solid #eee', display: 'flex', flexShrink: 0 }}>
          <input
            ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading}
            placeholder={t('chat_placeholder')}
            style={{ flex: 1, padding: '13px 14px', border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'inherit', background: '#fdfdfd', color: '#111' }}
          />
          <button
            onClick={sendMessage} disabled={isLoading || !input.trim()}
            style={{ padding: '0 18px', background: input.trim() && !isLoading ? '#e62117' : '#eee', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default', color: input.trim() && !isLoading ? '#fff' : '#bbb', fontFamily: "'Space Mono', monospace", fontSize: '14px', flexShrink: 0, transition: 'background 0.2s, color 0.2s' }}
          >→</button>
        </div>
      </div>

      {/* ✅ 플로팅 버튼 - 말풍선 SVG 아이콘 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title={isOpen ? '닫기' : 'MICHELIN CHAT'}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 500,
          width: '52px', height: '52px',
          background: isOpen ? '#333' : '#e62117',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {isOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
    </>
  )
}

export default ChatbotWidget