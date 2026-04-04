import { Topbar } from './Topbar';
import { Section } from './Section';
import { ScaleWidget, ScaleLegend } from './ScaleWidget';
import { BottomNav } from './BottomNav';

export function PhaseCScreen({ eval: ev, onPrev, onNext, active }) {
  const { userName, userCode, userSchool, fields, scales, setScale, notes, setNote, scores, save, saving } = ev;

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={2} scores={scores} onSave={() => save(true)} saving={saving} />

      <div className="phase-content">
        <div className="ph-banner p3">
          <span style={{ fontSize: '1.5rem' }}>🏁</span>
          <div>
            <h3>שלב ג׳ — הערכת סוף תוכנית <small style={{ fontWeight: 400, opacity: 0.7 }}>(מאי–יוני)</small></h3>
            <p>הערכה מסכמת — השוואה לנתוני הבסיס, לקחים והמלצות להמשך.</p>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-lbl">התקדמות שלב ג׳</div>
          <div className="pb-outer"><div className="pb-inner" style={{ width: `${scores[2]}%` }} /></div>
          <div className="pb-num">{scores[2]}%</div>
        </div>

        <ScaleLegend labels={['לא הושג', 'הושג חלקית', 'הושג ברובו', 'הושג במלואו']} />

        {/* השגת יעדים — 3 סעיפים */}
        <Section icon="🎯" iconBg="#fef3e2" title="השגת יעדים ותוצאות" desc="השוואה בין נקודת הפתיחה לנקודת הסוף" defaultOpen>
          {[
            { key: 'out1', label: 'הושג שיפור בתחום הנבחר במסגרת התוכנית' },
            { key: 'out2', label: 'שביעות הרצון של קהל היעד המשתתף בתוכנית גבוהה' },
            { key: 'out4', label: 'התוצאות שהושגו מצביעות על כדאיות ההשקעה בתוכנית' },
          ].map(({ key, label }) => (
            <div key={key} className="scale-item">
              <div className="scale-label">{label}</div>
              <ScaleWidget scaleKey={key} value={scales[key]} onChange={setScale} />
            </div>
          ))}
          <span className="nl">נתוני השוואה (התחלה → סוף):</span>
          <textarea className="na" value={notes.n8} onChange={e => setNote('n8', e.target.value)} placeholder="ציון ממוצע X → Y | נוכחות X% → Y%..." />
        </Section>

        {/* לקחים והמלצות */}
        <Section icon="💡" iconBg="#e8eef8" title="לקחים, תובנות והמלצות" desc="מה למדנו? מה היה שונה?">
          <span className="nl">🔴 מה לא עבד:</span>
          <textarea className="na" value={notes.n9}  onChange={e => setNote('n9',  e.target.value)} placeholder="מה נכשל? מה היה קשה?" />
          <span className="nl" style={{ marginTop: 10 }}>✅ מה עבד טוב:</span>
          <textarea className="na" value={notes.n10} onChange={e => setNote('n10', e.target.value)} placeholder="מה הצליח? מה לשכפל?" />
          <span className="nl" style={{ marginTop: 10 }}>🔄 המלצה לשנה הבאה:</span>
          <textarea className="na" value={notes.n11} onChange={e => setNote('n11', e.target.value)} placeholder="להמשיך? לשנות? להחליף?" />
        </Section>
      </div>

      <BottomNav phaseIndex={2} score={scores[2]} onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
