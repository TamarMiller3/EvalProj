import { useState } from 'react';
import { getEmoji, getVerbal } from '../constants/scoreCalc';

const GEM_URL = 'https://gemini.google.com/gem/1M3nW7mH9BrTXIgV5iMCOf96X0vR4JdG1?usp=sharing';

export function BottomNav({ phaseIndex, score, onPrev, onNext, nextLabel = 'הבא ←', showPrev = true }) {
  const [open, setOpen] = useState(false);
  const hasScore = score > 0;

  return (
    <div className="bottom-nav" style={{ position: 'relative' }}>
      {showPrev
        ? <button className="btn-prev" onClick={onPrev}>→ הקודם</button>
        : <div />
      }
      <div className="nav-center">
        <span className={`nav-score${hasScore ? ' has-score' : ''}`}>
          {hasScore ? `${getEmoji(score)} ${score}%` : '—'}
        </span>
        {hasScore && (
          <span className="nav-verbal has-score">
            {getVerbal(score, phaseIndex)}
          </span>
        )}

        <button onClick={() => setOpen(!open)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? '#fef3c7' : '#fffbeb',
          border: '2px solid #f59e0b', borderRadius: 12,
          padding: '8px 14px', cursor: 'pointer', flexShrink: 0
        }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>עוזר מדידה</div>
            <div style={{ fontSize: 10, color: '#b45309' }}>בנה כלי הערכה</div>
          </div>
        </button>

        {open && (
          <div style={{
            position: 'absolute', bottom: 70, left: 16,
            width: 300, background: '#fff', borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0', overflow: 'hidden',
            zIndex: 1000, direction: 'rtl'
          }}>
            <div style={{ background: '#1a2a4a', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>עוזר הערכה ומדידה</span>
              <button onClick={() => setOpen(false)} style={{ marginRight: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }}>X</button>
            </div>

            <div style={{ background: '#fff8e1', padding: '8px 12px', fontSize: 11, color: '#7a5f00', borderBottom: '1px solid #ffe082' }}>
              אנא אל תזינו שמות תלמידים, מספרי זהות או נתונים אישיים
            </div>

            <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.6 }}>
                הבוט יעזור לך לבנות כלי הערכה — שאלונים, מחוונים, סקרים ותוכניות הערכה.
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>בחרי נושא להתחיל:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['שאלון לתלמידים', 'שאלון למורים', 'סקר שביעות רצון', 'תוכנית הערכה'].map((t, i) => (
                  <a key={i} href={GEM_URL} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '6px 10px', background: '#fff', border: '1.5px solid #2563eb', borderRadius: 14, fontSize: 11, color: '#2563eb', textDecoration: 'none' }}>
                    {t}
                  </a>
                ))}
              </div>
              <a href={GEM_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', background: '#1a2a4a', color: '#fff', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                פתח את הבוט
              </a>
            </div>
          </div>
        )}
      </div>

      {onNext
        ? <button className="btn-next" onClick={onNext}>{nextLabel}</button>
        : <div />
      }
    </div>
  );
}
