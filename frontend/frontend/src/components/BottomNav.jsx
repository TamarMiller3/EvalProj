import { getEmoji, getVerbal } from '../constants/scoreCalc';

export function BottomNav({ phaseIndex, score, onPrev, onNext, nextLabel = 'הבא ←', showPrev = true }) {
  const hasScore = score > 0;
  return (
    <div className="bottom-nav">
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
        <a href="https://gemini.google.com/gem/1M3nW7mH9BrTXIgV5iMCOf96X0vR4JdG1?usp=sharing"
           target="_blank"
           rel="noopener noreferrer"
           style={{ display:'flex', alignItems:'center', gap:8, background:'#1a2a4a', borderRadius:12, padding:'8px 14px', textDecoration:'none', flexShrink:0 }}>
          <span style={{ fontSize:18 }}>🤖</span>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>עוזר מדידה</div>
            <div style={{ fontSize:10, color:'#90caf9' }}>בנה כלי הערכה</div>
          </div>
        </a>
      </div>
      {onNext
        ? <button className="btn-next" onClick={onNext}>{nextLabel}</button>
        : <div />
      }
    </div>
  );
}
