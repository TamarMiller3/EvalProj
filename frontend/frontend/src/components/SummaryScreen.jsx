import { Topbar } from './Topbar';
import { Section } from './Section';
import { BottomNav } from './BottomNav';
import { generateInsights, getEmoji } from '../constants/scoreCalc';

export function SummaryScreen({ eval: ev, onPrev, active }) {
  const { userName, userCode, userSchool, fields, notes, setNote,
          decision, setDecision, scores, save, saving, collectData } = ev;

  const data = collectData();
  const { insights, actions, dataRecs } = generateInsights(data, scores);

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={3} scores={scores} onSave={() => save(true)} saving={saving} />

      <div className="phase-content">
        <div className="ph-banner p4">
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <div>
            <h3>סיכום ולקחים</h3>
            <p>תמונה כוללת של הערכת התוכנית — ציונים, תובנות ומסקנות</p>
          </div>
        </div>

        {/* Score cards */}
        <div className="sum-grid">
          {[
            { label: 'שלב א׳ — הכנה',    score: scores[0], color: 'var(--navy)' },
            { label: 'שלב ב׳ — מהלך',   score: scores[1], color: 'var(--teal)' },
            { label: 'שלב ג׳ — תוצאות', score: scores[2], color: 'var(--amber)' },
          ].map(({ label, score, color }) => (
            <div key={label} className="scard">
              <div className="sval" style={{ color }}>{score}%</div>
              <div className="slbl">{label}</div>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="rec-box">
          <h4>💡 תובנות אוטומטיות</h4>
          <ul style={{ marginBottom: 12 }}>
            {insights.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <h4 style={{ color: '#b7800a', marginTop: 10 }}>🛠️ דרכי פעולה מומלצות</h4>
          <ul style={{ marginBottom: 12 }}>
            {actions.length
              ? actions.map((t, i) => <li key={i}>{t}</li>)
              : <li style={{ listStyle: 'none', color: 'var(--gray)', fontStyle: 'italic' }}>אין פריטים להצגה</li>}
          </ul>
          <h4 style={{ color: 'var(--navy)', marginTop: 10 }}>📊 דרכי שיפור הנתונים</h4>
          <ul>
            {dataRecs.length
              ? dataRecs.map((t, i) => <li key={i}>{t}</li>)
              : <li style={{ listStyle: 'none', color: 'var(--gray)', fontStyle: 'italic' }}>אין פריטים להצגה</li>}
          </ul>
        </div>

        {/* Decision */}
        <Section icon="🔮" iconBg="#fdecea" title="החלטה על המשך התוכנית" desc="סכמו את ההחלטה לאחר עיון בכל הנתונים" defaultOpen>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '12px 0' }}>
            {[
              { value: 'continue', label: '✅ להמשיך כמו שהוא' },
              { value: 'modify',   label: '🔄 להמשיך עם שינויים' },
              { value: 'replace',  label: '🔁 להחליף בתוכנית אחרת' },
              { value: 'stop',     label: '❌ לא להמשיך' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.87rem', cursor: 'pointer' }}>
                <input type="radio" name="decision" value={opt.value}
                       checked={decision === opt.value}
                       onChange={() => setDecision(opt.value)}
                       style={{ accentColor: 'var(--teal)' }} />
                {opt.label}
              </label>
            ))}
          </div>
          <span className="nl">הנמקה:</span>
          <textarea className="na" value={notes.n12} onChange={e => setNote('n12', e.target.value)} placeholder="הנמקה מפורטת..." />
        </Section>

        {/* General notes */}
        <Section icon="📝" iconBg="#e8f5f2" title="הערות סיכום כלליות" defaultOpen>
          <textarea className="na" style={{ minHeight: 100 }} value={notes.n13}
                    onChange={e => setNote('n13', e.target.value)} placeholder="סיכום כולל של הערכת התוכנית..." />
        </Section>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button className="btn-main" style={{ maxWidth: 320 }} onClick={() => save(true)} disabled={saving}>
            💾 שמור והגש הערכה סופית
          </button>
        </div>
      </div>

      <BottomNav phaseIndex={3} score={null} onPrev={onPrev} onNext={null}
                 showPrev={true} nextLabel="" />
    </div>
  );
}
