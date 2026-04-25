import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── TAROT DATA ──
const CARDS = [
  {sym:'☀️',name:'The Sun',th:'ดวงอาทิตย์',meaning:'ความสำเร็จ ความสุข พลังชีวิต'},
  {sym:'🌙',name:'The Moon',th:'ดวงจันทร์',meaning:'ความลึกลับ สัญชาตญาณ ความฝัน'},
  {sym:'⭐',name:'The Star',th:'ดาว',meaning:'ความหวัง การเยียวยา แรงบันดาลใจ'},
  {sym:'⚡',name:'The Tower',th:'หอคอย',meaning:'การเปลี่ยนแปลงฉับพลัน วิกฤต'},
  {sym:'🌍',name:'The World',th:'โลก',meaning:'ความสมบูรณ์ สำเร็จ จบรอบ'},
  {sym:'👁️',name:'High Priestess',th:'นักบวชหญิง',meaning:'ปัญญาลับ สัญชาตญาณ ความลึก'},
  {sym:'❤️',name:'The Lovers',th:'คนรัก',meaning:'ความรัก การเลือก ความสัมพันธ์'},
  {sym:'⚖️',name:'Justice',th:'ความยุติธรรม',meaning:'สมดุล กฎแห่งกรรม ความเที่ยงตรง'},
  {sym:'🎡',name:'Wheel of Fortune',th:'วงล้อชะตา',meaning:'โชค วัฏจักร โอกาสใหม่'},
  {sym:'🦁',name:'Strength',th:'พลัง',meaning:'ความแข็งแกร่งภายใน ความอดทน'},
  {sym:'🏺',name:'The Emperor',th:'จักรพรรดิ',meaning:'อำนาจ โครงสร้าง ความมั่นคง'},
  {sym:'🌺',name:'The Empress',th:'จักรพรรดินี',meaning:'ความอุดมสมบูรณ์ ความรัก ธรรมชาติ'},
  {sym:'🎭',name:'The Chariot',th:'รถศึก',meaning:'ชัยชนะ ความมุ่งมั่น การควบคุม'},
  {sym:'🌠',name:'The Hanged Man',th:'ชายแขวนคว่ำ',meaning:'การรอคอย มุมมองใหม่ การเสียสละ'},
  {sym:'💀',name:'Death',th:'ความตาย',meaning:'การเปลี่ยนผ่าน จบเพื่อเริ่มใหม่'},
  {sym:'🌊',name:'The Hermit',th:'ฤๅษี',meaning:'การค้นหาตัวเอง ความสงบ ปัญญา'},
  {sym:'🎺',name:'Judgement',th:'การพิพากษา',meaning:'การฟื้นคืน ตัดสิน ปลดปล่อย'},
  {sym:'🃏',name:'The Fool',th:'คนโง่',meaning:'เริ่มต้นใหม่ ความกล้า การผจญภัย'},
  {sym:'🔮',name:'The Magician',th:'นักมายากล',meaning:'พลังสร้างสรร เจตจำนง ทักษะ'},
  {sym:'😈',name:'The Devil',th:'มาร',meaning:'ข้อจำกัด ความโลภ สิ่งผูกมัด'},
  {sym:'🌸',name:'Temperance',th:'ความพอดี',meaning:'สมดุล ความพอดี การผสมผสาน'},
  {sym:'🏛️',name:'The Hierophant',th:'ปุโรหิต',meaning:'ประเพณี ความศรัทธา คำแนะนำ'},
]

const CELTIC_POSITIONS = [
  {n:1,label:'ตัวคุณ',desc:'แก่นแท้ของสถานการณ์'},
  {n:2,label:'สิ่งขวาง',desc:'พลังงานที่ขวางกั้น'},
  {n:3,label:'รากเหง้า',desc:'พื้นฐานของสถานการณ์'},
  {n:4,label:'อดีต',desc:'สิ่งที่กำลังจากไป'},
  {n:5,label:'ความเป็นไปได้',desc:'ศักยภาพสูงสุด'},
  {n:6,label:'อนาคตใกล้',desc:'พลังงานที่กำลังเข้ามา'},
  {n:7,label:'ทัศนคติ',desc:'มุมมองของคุณ'},
  {n:8,label:'แวดล้อม',desc:'อิทธิพลภายนอก'},
  {n:9,label:'ความหวัง/กลัว',desc:'ความรู้สึกลึกๆ'},
  {n:10,label:'ผลลัพธ์',desc:'ทิศทางที่น่าจะเป็น'},
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function drawCards(count) {
  return shuffle(CARDS).slice(0, count).map((c, i) => ({
    ...c,
    reversed: Math.random() > 0.72,
    flipped: false,
    position: count === 10 ? CELTIC_POSITIONS[i].label : count === 3 ? ['อดีต','ปัจจุบัน','อนาคต'][i] : 'ไพ่หลัก'
  }))
}

// ── STYLES ──
const S = {
  app: {
    minHeight: '100vh',
    background: '#0A0612',
    color: '#EDE8D8',
    fontFamily: "'Sarabun', sans-serif",
    fontWeight: 300,
    overflowX: 'hidden',
    position: 'relative',
  },
  bgGlow: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(74,47,138,0.5) 0%, transparent 70%)',
  },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 60,
    background: 'rgba(10,6,18,0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(201,168,76,0.15)',
  },
  logo: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: 17, color: '#C9A84C', letterSpacing: 2,
  },
  navLinks: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  navBtn: (active) => ({
    background: 'none',
    border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
    color: active ? '#C9A84C' : '#9B8FA8',
    padding: '7px 14px', borderRadius: 100,
    cursor: 'pointer', fontSize: 13,
    fontFamily: "'Sarabun', sans-serif",
    transition: 'all .2s',
  }),
  navBtnPrimary: {
    background: 'linear-gradient(135deg, #6B5320, #C9A84C)',
    border: 'none', color: '#1A0F00',
    padding: '7px 16px', borderRadius: 100,
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    fontFamily: "'Sarabun', sans-serif",
  },
  page: { position: 'relative', zIndex: 1, padding: '90px 20px 60px', maxWidth: 900, margin: '0 auto' },
  hero: {
    position: 'relative', zIndex: 1,
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '100px 20px 60px', textAlign: 'center',
  },
  h1: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: 'clamp(28px,5vw,64px)',
    color: '#E8C97A',
    textShadow: '0 0 60px rgba(201,168,76,0.3)',
    marginBottom: 12, lineHeight: 1.1,
  },
  sectionTitle: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: 20, color: '#C9A84C', textAlign: 'center', marginBottom: 8,
  },
  divider: { width: 50, height: 1, background: '#C9A84C', margin: '12px auto 32px', opacity: .4 },
  box: {
    background: 'rgba(26,17,48,0.8)',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: 20, padding: 28,
    backdropFilter: 'blur(8px)',
  },
  input: {
    width: '100%', padding: '14px 16px',
    background: 'rgba(10,6,18,0.6)',
    border: '1px solid rgba(201,168,76,0.25)',
    borderRadius: 12, color: '#EDE8D8',
    fontFamily: "'Sarabun', sans-serif", fontSize: 15,
    resize: 'vertical', minHeight: 80,
    outline: 'none',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #4A2F8A, #7B4FCC)',
    border: '1px solid rgba(201,168,76,0.4)',
    color: '#E8C97A', padding: '14px 28px', borderRadius: 100,
    cursor: 'pointer', fontSize: 15, fontWeight: 500,
    fontFamily: "'Sarabun', sans-serif", transition: 'all .3s',
    width: '100%', marginTop: 16,
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid rgba(201,168,76,0.35)',
    color: '#C9A84C', padding: '12px 24px', borderRadius: 100,
    cursor: 'pointer', fontSize: 14,
    fontFamily: "'Sarabun', sans-serif", transition: 'all .3s',
  },
  spreadOpts: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 },
  spreadOpt: (active) => ({
    flex: 1, minWidth: 110, padding: '12px 8px', textAlign: 'center',
    background: active ? 'rgba(201,168,76,0.1)' : 'rgba(10,6,18,0.5)',
    border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
    borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
  }),
  // Celtic grid using absolute positions
  celticBoard: {
    position: 'relative', width: '100%',
    minHeight: 480, marginBottom: 24,
    background: 'rgba(10,6,18,0.4)',
    borderRadius: 16, padding: 20,
    border: '1px solid rgba(201,168,76,0.1)',
  },
}

// ── CARD COMPONENT ──
function TarotCard({ card, size = 72, onFlip, showLabel }) {
  const h = Math.round(size * 1.62)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {showLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
          <div style={{
            width: 15, height: 15, borderRadius: '50%',
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
            fontSize: 8, color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{showLabel.n}</div>
          <div style={{ fontSize: 8, color: '#9B8FA8', textTransform: 'uppercase', letterSpacing: .5, maxWidth: 70, textAlign: 'center' }}>{showLabel.label}</div>
        </div>
      )}
      <div
        onClick={onFlip}
        style={{
          width: size, height: h, borderRadius: 8, cursor: 'pointer',
          position: 'relative', perspective: 600, flexShrink: 0,
        }}
      >
        <div style={{
          width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform .65s cubic-bezier(.4,0,.2,1)',
          transform: card.flipped ? 'rotateY(180deg)' : 'none',
          borderRadius: 8, position: 'relative',
        }}>
          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg,#2D1B5E,#1A1130)',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * .35, opacity: .35, color: '#C9A84C',
          }}>✦</div>
          {/* Face */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            backfaceVisibility: 'hidden',
            transform: `rotateY(180deg)${card.reversed ? ' rotate(180deg)' : ''}`,
            background: 'linear-gradient(160deg,#1E1040,#0D0820)',
            border: '1px solid rgba(201,168,76,0.55)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4, padding: 5,
          }}>
            <div style={{ fontSize: size * .3 }}>{card.sym}</div>
            <div style={{ fontSize: 7, color: '#C9A84C', textAlign: 'center', fontWeight: 500, lineHeight: 1.3 }}>{card.th}</div>
            {card.reversed && <div style={{ fontSize: 7, color: 'rgba(255,107,157,.8)' }}>กลับหัว</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CELTIC CROSS LAYOUT ──
function CelticCrossBoard({ cards, onFlip, detail }) {
  if (!cards || cards.length < 10) return null

  // Positions: {top%, left%, rotate}
  // Board is relative, each slot absolute
  const slots = [
    { top: '35%', left: '28%' },      // 0: center (card 1)
    { top: '35%', left: '28%', rotate: 90 }, // 1: cross (card 2)
    { top: '60%', left: '33%' },      // 2: bottom
    { top: '35%', left: '10%' },      // 3: left
    { top: '10%', left: '33%' },      // 4: top
    { top: '35%', left: '56%' },      // 5: right
    { top: '73%', left: '78%' },      // 6: staff bottom (7)
    { top: '50%', left: '78%' },      // 7: staff (8)
    { top: '27%', left: '78%' },      // 8: staff (9)
    { top: '5%',  left: '78%' },      // 9: staff top (10)
  ]

  return (
    <div style={S.celticBoard}>
      <div style={{ fontSize: 10, color: 'rgba(201,168,76,0.4)', textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
        ✦ Celtic Cross — คลิกไพ่เพื่อพลิก ✦
      </div>
      <div style={{ position: 'relative', height: 420 }}>
        {cards.map((card, i) => {
          const s = slots[i]
          const isOverlay = i === 1
          return (
            <div key={i} style={{
              position: 'absolute',
              top: s.top, left: s.left,
              transform: `translate(-50%, -50%)${isOverlay ? ' rotate(90deg)' : ''}`,
              zIndex: isOverlay ? 3 : 2,
            }}>
              <TarotCard
                card={card}
                size={60}
                onFlip={() => onFlip(i)}
                showLabel={!isOverlay ? CELTIC_POSITIONS[i] : null}
              />
            </div>
          )
        })}
      </div>
      {detail && (
        <div style={{
          background: 'rgba(10,6,18,0.6)',
          border: '1px solid rgba(201,168,76,0.12)',
          borderRadius: 12, padding: '12px 14px', marginTop: 8,
        }}>
          <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 500 }}>
            ใบที่ {detail.n} — {detail.position}
          </div>
          <div style={{ fontSize: 13, color: '#EDE8D8', marginTop: 4 }}>
            {detail.sym} {detail.th} {detail.reversed ? '(กลับหัว)' : ''}
          </div>
          <div style={{ fontSize: 12, color: '#9B8FA8', marginTop: 4, lineHeight: 1.6 }}>
            {detail.meaning}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN APP ──
export default function App() {
  const [page, setPage] = useState('hero')
  const [spread, setSpread] = useState('one')
  const [cards, setCards] = useState([])
  const [question, setQuestion] = useState('')
  const [reading, setReading] = useState('')
  const [loading, setLoading] = useState(false)
  const [flippedDetail, setFlippedDetail] = useState(null)
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [modalMode, setModalMode] = useState(null) // 'login' | 'register'
  const [donateAmt, setDonateAmt] = useState(199)
  const [payMethod, setPayMethod] = useState('promptpay')
  const [usedToday, setUsedToday] = useState(1)

  const showToast = (msg) => {
    setToast(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2800)
  }

  const initCards = useCallback(() => {
    const count = spread === 'one' ? 1 : spread === 'three' ? 3 : 10
    setCards(drawCards(count))
    setReading('')
    setFlippedDetail(null)
  }, [spread])

  useEffect(() => { if (page === 'reading') initCards() }, [page, spread])

  const flipCard = (i) => {
    setCards(prev => {
      const next = [...prev]
      next[i] = { ...next[i], flipped: !next[i].flipped }
      return next
    })
    setFlippedDetail(cards[i] ? { ...cards[i], n: i + 1 } : null)
  }

  const flipAll = () => {
    setCards(prev => prev.map(c => ({ ...c, flipped: true })))
  }

  const startReading = async () => {
    if (!question.trim()) { showToast('กรุณาระบุคำถามก่อนครับ 🔮'); return }
    setCards(prev => prev.map(c => ({ ...c, flipped: true })))
    setLoading(true)
    setReading('')
    try {
      const res = await fetch(`${API_URL}/api/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, cards, spread }),
      })
      const data = await res.json()
      setReading(data.reading || 'ไม่สามารถรับคำทำนายได้ในขณะนี้')
      setUsedToday(u => Math.min(u + 1, 3))
    } catch {
      setReading('✦ ขณะนี้ระบบกำลังปรับปรุง กรุณาลองใหม่อีกครั้ง หรือลองใหม่ในอีกสักครู่ครับ')
    }
    setLoading(false)
  }

  const saveReading = () => {
    const item = { id: Date.now(), date: 'เมื่อกี้', question: question || 'คำถามของฉัน', cards: cards.map(c => c.sym), reading }
    setHistory(prev => [item, ...prev])
    showToast('💾 บันทึกแล้ว!')
  }

  // ── PAGES ──
  const renderHero = () => (
    <div style={S.hero}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 16, opacity: .8 }}>✦ ดูดวงด้วยปัญญาประดิษฐ์ ✦</div>
      <h1 style={S.h1}>ลัคนาไพ่</h1>
      <div style={{ fontStyle: 'italic', fontSize: 17, color: '#9B8FA8', marginBottom: 36 }}>ไพ่ทาโร่ AI — อ่านชะตา เปิดเผยความจริง</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
        <button style={S.btnPrimary} onClick={() => setPage('reading')} onMouseEnter={e => e.target.style.opacity=.85} onMouseLeave={e => e.target.style.opacity=1}>
          ✦ เริ่มดูดวงฟรี
        </button>
        <button style={{...S.btnOutline, marginTop: 0}} onClick={() => setPage('plans')}>ดูแพ็กเกจสมาชิก</button>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {['🌙','☀️','⭐','🔮','🌟'].map((e, i) => (
          <div key={i} style={{
            width: 68, height: 112, borderRadius: 8,
            background: 'linear-gradient(160deg,#2D1B5E,#1A1130)',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            transform: `rotate(${[-8,4,-2,7,-5][i]}deg)`,
            animation: `float${i} 3s ease-in-out infinite`,
          }}>{e}</div>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Sarabun:wght@300;400;500&display=swap');
      `}</style>
    </div>
  )

  const renderReading = () => (
    <div style={S.page}>
      <div style={S.sectionTitle}>✦ ดูดวงไพ่ทาโร่</div>
      <div style={S.divider}></div>

      {/* Daily limit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#9B8FA8' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < usedToday ? '#C9A84C' : 'rgba(201,168,76,0.2)', boxShadow: i === usedToday-1 ? '0 0 6px #C9A84C' : 'none' }} />)}
        </div>
        <span>ใช้ไปแล้ว {usedToday}/3 ครั้ง วันนี้ (ฟรี)</span>
        <button style={{ ...S.btnOutline, marginLeft: 'auto', padding: '4px 12px', fontSize: 11 }} onClick={() => setPage('plans')}>อัปเกรด →</button>
      </div>

      <div style={S.box}>
        {/* Question */}
        <label style={{ display: 'block', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#C9A84C', marginBottom: 10 }}>คำถามที่ต้องการคำตอบ</label>
        <textarea
          style={S.input}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="เช่น: ความรักของฉันจะเป็นอย่างไร? การงานจะก้าวหน้าไหม?"
        />

        {/* Spread select */}
        <label style={{ display: 'block', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#C9A84C', margin: '20px 0 12px' }}>เลือกรูปแบบไพ่</label>
        <div style={S.spreadOpts}>
          {[
            { key: 'one', icon: '🃏', name: 'ไพ่ใบเดียว', desc: 'คำตอบตรงๆ' },
            { key: 'three', icon: '🃏🃏🃏', name: '3 ใบ', desc: 'อดีต · ปัจจุบัน · อนาคต' },
            { key: 'celtic', icon: '🌟', name: 'Celtic Cross', desc: '10 ใบ · วิเคราะห์ลึก' },
          ].map(s => (
            <div key={s.key} style={S.spreadOpt(spread === s.key)} onClick={() => setSpread(s.key)}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{s.icon}</div>
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: '#9B8FA8' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Cards */}
        {spread === 'celtic' ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btnOutline, padding: '6px 14px', fontSize: 12 }} onClick={flipAll}>พลิกทุกใบ</button>
              <button style={{ ...S.btnOutline, padding: '6px 14px', fontSize: 12, color: '#7B4FCC', borderColor: 'rgba(123,79,204,.4)' }} onClick={initCards}>สับใหม่</button>
            </div>
            <CelticCrossBoard cards={cards} onFlip={flipCard} detail={flippedDetail} />
          </>
        ) : (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
            {cards.map((card, i) => (
              <TarotCard key={i} card={card} size={80} onFlip={() => flipCard(i)} />
            ))}
          </div>
        )}

        <button style={S.btnPrimary} onClick={startReading} disabled={loading}>
          {loading ? '🔮 AI กำลังอ่านไพ่...' : '✦ เปิดไพ่และรับคำทำนาย'}
        </button>

        {/* Result */}
        {(loading || reading) && (
          <div style={{ background: 'rgba(10,6,18,0.6)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 14, padding: 22, marginTop: 20 }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 14, color: '#C9A84C', marginBottom: 14 }}>✦ คำทำนายของคุณ</div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20 }}>
                <div style={{ width: 36, height: 36, border: '2px solid rgba(201,168,76,.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: 13, color: '#9B8FA8', fontStyle: 'italic' }}>AI กำลังวิเคราะห์ไพ่...</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {cards.slice(0, 5).map((c, i) => (
                    <span key={i} style={{ padding: '2px 10px', background: 'rgba(123,79,204,0.2)', border: '1px solid rgba(123,79,204,0.4)', borderRadius: 100, fontSize: 12, color: '#7B4FCC' }}>
                      {c.sym} {c.th}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.9, color: '#EDE8D8', whiteSpace: 'pre-wrap' }}>{reading}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <button style={{ ...S.btnOutline, padding: '7px 16px', fontSize: 12, color: '#4DD9C8', borderColor: 'rgba(77,217,200,.4)' }} onClick={saveReading}>💾 บันทึก</button>
                  <button style={{ ...S.btnOutline, padding: '7px 16px', fontSize: 12, color: '#FF6B9D', borderColor: 'rgba(255,107,157,.4)' }} onClick={() => showToast('📋 คัดลอกลิงก์แล้ว!')}>↗ แชร์</button>
                  <button style={{ ...S.btnOutline, padding: '7px 16px', fontSize: 12 }} onClick={() => { setReading(''); setQuestion(''); initCards() }}>🔄 ดูใหม่</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const renderHistory = () => (
    <div style={S.page}>
      <div style={S.sectionTitle}>✦ ประวัติการดูดวง</div>
      <div style={{ fontSize: 13, color: '#9B8FA8', textAlign: 'center', marginBottom: 8 }}>บันทึกคำทำนายทั้งหมดของคุณ</div>
      <div style={S.divider}></div>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9B8FA8', padding: 48, fontSize: 15 }}>ยังไม่มีประวัติการดูดวง<br/><br/>
          <button style={S.btnPrimary} onClick={() => setPage('reading')}>เริ่มดูดวงเลย →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map(h => (
            <div key={h.id} style={{ background: 'rgba(26,17,48,0.6)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, color: '#9B8FA8', whiteSpace: 'nowrap' }}>{h.date}</div>
              <div style={{ flex: 1, fontSize: 14 }}>{h.question}</div>
              <div style={{ fontSize: 20, letterSpacing: 2 }}>{h.cards.slice(0,3).join('')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderPlans = () => (
    <div style={S.page}>
      <div style={S.sectionTitle}>✦ แพ็กเกจสมาชิก</div>
      <div style={{ fontSize: 13, color: '#9B8FA8', textAlign: 'center', marginBottom: 8 }}>เลือกแผนที่เหมาะกับคุณ</div>
      <div style={S.divider}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
        {[
          { icon: '🌙', name: 'ฟรี', price: '฿0', per: '/เดือน', desc: 'เริ่มต้นสัมผัสไพ่ทาโร่', features: ['ดูดวงได้ 3 ครั้ง/วัน','ไพ่ 1 ใบ และ 3 ใบ','บันทึกประวัติ 7 วัน','คำทำนายพื้นฐาน'], featured: false, btnTxt: 'เริ่มใช้งาน', amt: null },
          { icon: '⭐', name: 'ดาวทอง', price: '฿199', per: '/เดือน', desc: 'สำหรับผู้ต้องการคำแนะนำลึกซึ้ง', features: ['ดูดวงไม่จำกัด','Celtic Cross 10 ใบ','บันทึกไม่จำกัด','AI วิเคราะห์เชิงลึก','คำแนะนำรายเดือน'], featured: true, btnTxt: 'สมัครเลย', amt: 199 },
          { icon: '🔮', name: 'นักษัตร', price: '฿499', per: '/เดือน', desc: 'สำหรับผู้แสวงหาความจริงแท้', features: ['ทุกอย่างใน ดาวทอง','Session กับ AI นักษัตร','วิเคราะห์ดวงชะตารายปี','5 คำถามพิเศษ/เดือน','Priority support'], featured: false, btnTxt: 'สมัครเลย', amt: 499 },
        ].map(plan => (
          <div key={plan.name} style={{ background: 'rgba(26,17,48,0.7)', border: `${plan.featured ? '1.5' : '1'}px solid rgba(201,168,76,${plan.featured ? '.5' : '.15'})`, borderRadius: 20, padding: '28px 22px', position: 'relative', transition: 'transform .3s' }}>
            {plan.featured && <div style={{ position: 'absolute', top: 14, right: 14, background: '#C9A84C', color: '#1A0F00', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 100, letterSpacing: 1 }}>แนะนำ</div>}
            <div style={{ fontSize: 30, marginBottom: 10 }}>{plan.icon}</div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 15, color: '#C9A84C', marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontSize: 26, fontWeight: 300, marginBottom: 4 }}>{plan.price} <span style={{ fontSize: 13, color: '#9B8FA8' }}>{plan.per}</span></div>
            <div style={{ fontSize: 13, color: '#9B8FA8', marginBottom: 18 }}>{plan.desc}</div>
            <ul style={{ listStyle: 'none', marginBottom: 22 }}>
              {plan.features.map(f => <li key={f} style={{ fontSize: 13, padding: '5px 0', display: 'flex', gap: 8 }}><span style={{ color: '#C9A84C', fontSize: 9, marginTop: 3 }}>✦</span>{f}</li>)}
            </ul>
            <button
              style={{ width: '100%', padding: 12, borderRadius: 100, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif", fontSize: 14, fontWeight: 500, border: plan.featured ? 'none' : '1px solid rgba(201,168,76,.3)', background: plan.featured ? 'linear-gradient(135deg,#6B5320,#C9A84C)' : 'transparent', color: plan.featured ? '#1A0F00' : '#C9A84C' }}
              onClick={() => { if (plan.amt) { setDonateAmt(plan.amt); setPage('donate') } else setModalMode('register') }}
            >{plan.btnTxt}</button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDonate = () => (
    <div style={S.page}>
      <div style={S.sectionTitle}>✦ สนับสนุนลัคนาไพ่</div>
      <div style={{ fontSize: 13, color: '#9B8FA8', textAlign: 'center', marginBottom: 8 }}>ช่วยให้เราพัฒนาและดูแลระบบต่อไป</div>
      <div style={S.divider}></div>
      <div style={{ ...S.box, maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 18, color: '#C9A84C', marginBottom: 8 }}>💝 ให้กำลังใจ</div>
        <div style={{ color: '#9B8FA8', fontSize: 13, marginBottom: 24 }}>ทุกการสนับสนุนช่วยให้ AI ของเราฉลาดขึ้น</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[50,100,199,299,499,1000].map(amt => (
            <button key={amt}
              style={{ padding: 13, borderRadius: 12, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif", fontSize: 14, fontWeight: 500, border: `1px solid ${donateAmt===amt ? '#C9A84C' : 'rgba(201,168,76,.2)'}`, background: donateAmt===amt ? 'rgba(201,168,76,.12)' : 'rgba(10,6,18,.5)', color: donateAmt===amt ? '#C9A84C' : '#EDE8D8' }}
              onClick={() => setDonateAmt(amt)}
            >฿{amt.toLocaleString()}</button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#9B8FA8', marginBottom: 12 }}>ช่องทางชำระเงิน</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          {[['promptpay','📱 PromptPay'],['stripe','💳 บัตรเครดิต'],['crypto','₿ Crypto']].map(([key,label]) => (
            <button key={key}
              style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${payMethod===key ? '#C9A84C' : 'rgba(201,168,76,.2)'}`, background: payMethod===key ? 'rgba(201,168,76,.08)' : 'rgba(10,6,18,.4)', color: payMethod===key ? '#C9A84C' : '#9B8FA8', cursor: 'pointer', fontSize: 13, fontFamily: "'Sarabun',sans-serif" }}
              onClick={() => setPayMethod(key)}
            >{label}</button>
          ))}
        </div>

        {payMethod === 'promptpay' && (
          <div style={{ background: 'white', borderRadius: 14, padding: 18, marginBottom: 16, display: 'inline-block' }}>
            <div style={{ width: 150, height: 150, background: 'repeating-conic-gradient(#000 0% 25%,#fff 0% 50%) 0 0/18px 18px', borderRadius: 4 }} />
            <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>สแกนด้วย Mobile Banking</div>
          </div>
        )}

        <button
          style={{ width: '100%', padding: 15, background: 'linear-gradient(135deg,#6B5320,#C9A84C)', border: 'none', borderRadius: 100, color: '#1A0F00', fontSize: 16, fontWeight: 700, fontFamily: "'Sarabun',sans-serif", cursor: 'pointer' }}
          onClick={() => showToast(`💝 ขอบคุณที่สนับสนุน ฿${donateAmt.toLocaleString()} ♥`)}
        >✦ ยืนยันการสนับสนุน ฿{donateAmt.toLocaleString()}</button>
        <div style={{ marginTop: 12, fontSize: 12, color: '#9B8FA8' }}>🔒 ปลอดภัย · ใบเสร็จส่งทาง Email</div>
      </div>
    </div>
  )

  // ── MODAL ──
  const renderModal = () => modalMode && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setModalMode(null)}>
      <div style={{ background: '#110D1E', border: '1px solid rgba(201,168,76,.25)', borderRadius: 22, padding: 36, width: '90%', maxWidth: 380, position: 'relative' }}>
        <button style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#9B8FA8', fontSize: 18, cursor: 'pointer' }} onClick={() => setModalMode(null)}>✕</button>
        <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 18, color: '#C9A84C', marginBottom: 22 }}>
          {modalMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกฟรี'}
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[['🌐','Google'],['📘','Facebook']].map(([icon,name]) => (
            <button key={name} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid rgba(201,168,76,.2)', background: 'rgba(10,6,18,.5)', color: '#EDE8D8', cursor: 'pointer', fontSize: 13, fontFamily: "'Sarabun',sans-serif" }} onClick={() => { setModalMode(null); showToast(`✦ เชื่อมต่อ ${name} สำเร็จ!`) }}>
              {icon} {name}
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#9B8FA8', margin: '0 0 14px', position: 'relative' }}>
          <span style={{ background: '#110D1E', padding: '0 10px', position: 'relative', zIndex: 1 }}>หรือใช้ Email</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(201,168,76,.1)' }} />
        </div>
        {['Email','รหัสผ่าน'].map(f => (
          <div key={f} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#9B8FA8', marginBottom: 6 }}>{f}</label>
            <input type={f === 'รหัสผ่าน' ? 'password' : 'email'} style={{ ...S.input, minHeight: 0, padding: '11px 14px' }} placeholder={f === 'Email' ? 'your@email.com' : '••••••••'} />
          </div>
        ))}
        <button style={S.btnPrimary} onClick={() => { setModalMode(null); showToast(modalMode === 'login' ? '✦ ยินดีต้อนรับกลับ!' : '✦ สมัครสำเร็จ!') }}>
          {modalMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#9B8FA8' }}>
          {modalMode === 'login' ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีแล้ว? '}
          <span style={{ color: '#C9A84C', cursor: 'pointer' }} onClick={() => setModalMode(modalMode === 'login' ? 'register' : 'login')}>
            {modalMode === 'login' ? 'สมัครฟรี' : 'เข้าสู่ระบบ'}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Sarabun:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0A0612; }
      `}</style>
      <div style={S.bgGlow} />

      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setPage('hero')}>✦ ลัคนาไพ่</div>
        <div style={S.navLinks}>
          {[['reading','ดูดวง'],['history','ประวัติ'],['plans','สมาชิก'],['donate','สนับสนุน']].map(([p,label]) => (
            <button key={p} style={S.navBtn(page===p)} onClick={() => setPage(p)}>{label}</button>
          ))}
          <button style={S.navBtnPrimary} onClick={() => setModalMode('login')}>เข้าสู่ระบบ</button>
        </div>
      </nav>

      {/* PAGES */}
      {page === 'hero' && renderHero()}
      {page === 'reading' && renderReading()}
      {page === 'history' && renderHistory()}
      {page === 'plans' && renderPlans()}
      {page === 'donate' && renderDonate()}

      {/* MODAL */}
      {renderModal()}

      {/* TOAST */}
      <div style={{
        position: 'fixed', bottom: 28, left: '50%',
        transform: `translateX(-50%) translateY(${toastVisible ? 0 : 100}px)`,
        background: 'rgba(26,17,48,0.95)', border: '1px solid rgba(201,168,76,.3)',
        borderRadius: 100, padding: '11px 22px', fontSize: 14, color: '#EDE8D8',
        zIndex: 300, transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)', whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>{toast}</div>

      {/* FOOTER */}
      {page !== 'hero' && (
        <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(201,168,76,.1)', padding: '28px 24px', textAlign: 'center', fontSize: 13, color: '#9B8FA8' }}>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", color: '#C9A84C', marginBottom: 8 }}>✦ ลัคนาไพ่</div>
          <div>ดูดวงด้วยปัญญาประดิษฐ์ · สงวนลิขสิทธิ์ 2025</div>
        </footer>
      )}
    </div>
  )
}