import { STEPS } from '../constants/formFields';
import { getEmoji } from '../constants/scoreCalc';

const PHASE_KEYS = ['phase0', 'phase1', 'phase2', 'phase3'];

export function StepBar({ currentPhase, scores, onNavigate }) {
  return (
    <div className="step-bar">
      {STEPS.map((step, i) => {
        const done     = i < currentPhase;
        const cur      = i === currentPhase;
        const pct      = scores[i] || 0;
        const hasScore = pct > 0;
        const dotContent = done ? '✓' : (hasScore ? `${pct}%` : String(i + 1));
        const clickable = onNavigate != null;

        return (
          <div key={i} className="step" style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`step-wrap${cur ? ' current-step' : ''}${hasScore ? ' has-score' : ''}`}
              onClick={() => clickable && onNavigate(PHASE_KEYS[i])}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              <div className={`step-dot${done ? ' done' : cur ? ' current' : ''}`}>
                {dotContent}
              </div>
              <div className="step-label">{step.label}</div>
              {hasScore && <div className="step-verbal">{getEmoji(pct)}</div>}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line${done ? ' done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

