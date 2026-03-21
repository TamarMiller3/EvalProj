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
      </div>
      {onNext
        ? <button className="btn-next" onClick={onNext}>{nextLabel}</button>
        : <div />
      }
    </div>
  );
}
