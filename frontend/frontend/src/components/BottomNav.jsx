import { useState } from 'react';
import { getEmoji, getVerbal } from '../constants/scoreCalc';

const GEM_URL = 'https://gemini.google.com/gem/1M3nW7mH9BrTXIgV5iMCOf96X0vR4JdG1?usp=sharing';

const PHASES = [
  { label: "א׳ – טרום", index: 0 },
  { label: "ב׳ – מהלך", index: 1 },
  { label: "ג׳ – סוף",  index: 2 },
  { label: "סיכום",     index: 3 },
];

export function BottomNav({ phaseIndex, score, onPrev, onNext, nextLabel = 'הבא ←', showPrev = true, scores = [] }) {
  const [gemOpen, setGemOpen] = useState(false);
  const hasScore = score > 0;

  return (
    <div className="phase-sidebar">

      {/* Steps */}
      <div className="sidebar-steps">
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'center' }}>שלבי ההערכה</div>
        {PHASES.map((ph) => {
          const s = scores[ph.index] || 0;
          const isCurrent = ph.index === phaseIndex;
          const isDone = s > 0 && !isCurrent;
          return (
            <div key={ph.index} className={`sidebar-step${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}`}>
              <div className="sidebar-step-inner">
                <div className="sidebar-step-num">{ph.index + 1}</div>
                <span className="sidebar-step-label">{ph.label}</span>
              </div>
              {s > 0 && (
                <div className="sidebar-step-score">{getEmoji(s)} {s}%</div>
              )}
              {isCurrent && (
                <div className="sidebar-progress">
                  <div className="sidebar-progress-fill" style={{ width: `${score}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <div className="sidebar-nav">

        {/* Score */}
        {hasScore && (
          <div className="sidebar-score">
            <div className={`sidebar-score-num${hasScore ? ' has-score' : ''}`}>
              {getEmoji(score)} {score}%
            </div>
            <div className={`sidebar-score-verbal${hasScore ? ' has-score' : ''}`}>
              {getVerbal(score, phaseIndex)}
            </div>
          </div>
        )}

        {/* Bot button */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setGemOpen(!gemOpen)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: 10,
            padding: '8px 10px', cursor: 'pointer'
          }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>עוזר מדידה</div>
              <div style={{ fontSize: 9, color: '#b45309' }}>בנה כלי הערכה</div>
            </div>
          </button>

          {gemOpen && (
            <div style={{
              position: 'absolute', bottom: 50, left: 0, right: 0,
              background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 1000, direction: 'rtl'
            }}>
              <div style={{ background: '#1a2a4a', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>🤖</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>עוזר הערכה ומדידה</span>
                <button onClick={() => setGemOpen(false)} style={{ marginRight: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 5, padding: '1px 7px', cursor: 'pointer', fontSize: 12 }}>X</button>
              </div>
              <div style={{ background: '#fff8e1', padding: '6px 10px', fontSize: 10, color: '#7a5f00', borderBottom: '1px solid #ffe082' }}>
                אנא אל תזינו שמות תלמידים או נתונים אישיים
              </div>
              <div style={{ padding: '10px' }}>
                <p style={{ fontSize: 11, color: '#475569', margin: '0 0 8px', lineHeight: 1.5 }}>
                  הבוט יעזור לך לבנות שאלונים, מחוונים וסקרים.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {['שאלון לתלמידים', 'שאלון למורים', 'סקר שביעות רצון', 'תוכנית הערכה'].map((t, i) => (
                    <a key={i} href={GEM_URL} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '4px 8px', background: '#fff', border: '1.5px solid #2563eb', borderRadius: 12, fontSize: 10, color: '#2563eb', textDecoration: 'none' }}>
                      {t}
                    </a>
                  ))}
                </div>
                <a href={GEM_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', background: '#1a2a4a', color: '#fff', padding: 8, borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  פתח את הבוט
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Next button */}
        {onNext && (
          <button className="btn-next" onClick={onNext}>{nextLabel}</button>
        )}

        {/* Prev button */}
        {showPrev && onPrev && (
          <button className="btn-prev" onClick={onPrev}>→ הקודם</button>
        )}
      </div>
    </div>
  );
}
