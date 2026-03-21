import { StepBar } from './StepBar';

export function Topbar({ userName, userCode, userSchool, fields, currentPhase, scores, onSave, saving }) {
  const prog   = fields?.['f-prog']   || '';
  const year   = fields?.['f-year']   || '';
  const domain = fields?.['f-domain'] || '';
  const target = fields?.['f-target'] || '';

  const miniItems = [
    prog        && <span key="prog"   className="prog-mini-item"><strong>{prog}</strong></span>,
    userSchool  && <span key="school" className="prog-mini-item">🏫 {userSchool}</span>,
    year        && <span key="year"   className="prog-mini-item">📅 {year}</span>,
    domain      && <span key="domain" className="prog-mini-item">📚 {domain}</span>,
    target      && <span key="target" className="prog-mini-item">👥 {target}</span>,
  ].filter(Boolean);

  return (
    <div className="topbar">
      <div className="topbar-row1">
        <div className="topbar-title">🎓 הערכת תוכניות חינוכיות</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-save-sm" onClick={onSave} disabled={saving}>
            {saving ? '...' : '💾 שמור'}
          </button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{userName}</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.55, fontFamily: 'monospace', letterSpacing: 2 }}>{userCode}</div>
          </div>
        </div>
      </div>
      <div className="prog-mini">
        {miniItems.length
          ? miniItems
          : <span className="prog-mini-empty">פרטי התוכנית יופיעו כאן לאחר מילוי שלב א׳</span>
        }
      </div>
      <StepBar currentPhase={currentPhase} scores={scores} />
    </div>
  );
}
