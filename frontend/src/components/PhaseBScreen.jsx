import { Topbar } from './Topbar';
import { Section } from './Section';
import { ScaleWidget, ScaleLegend } from './ScaleWidget';
import { BottomNav } from './BottomNav';

export function PhaseBScreen({ eval: ev, onPrev, onNext, active }) {
  const { userName, userCode, userSchool, fields, scales, setScale, notes, setNote, scores, save, saving } = ev;

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={1} scores={scores} onSave={() => save(true)} saving={saving} />

      <div className="phase-content">
        <div className="ph-banner p2">
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <div>
            <h3>שלב ב׳ — במהלך התוכנית <small style={{ fontWeight: 400, opacity: 0.7 }}>(ספטמבר–אפריל)</small></h3>
            <p>מעקב שוטף ומדידת ביניים. ניתן ורצוי למלא מספר פעמים לאורך השנה.</p>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-lbl">התקדמות שלב ב׳</div>
          <div className="pb-outer"><div className="pb-inner" style={{ width: `${scores[1]}%` }} /></div>
          <div className="pb-num">{scores[1]}%</div>
        </div>

        <ScaleLegend />

        {/* סדירות וכמות — 2 סעיפים */}
        <Section icon="📅" iconBg="#e8f5f2" title="סדירות וכמות" desc="האם התוכנית מתקיימת כמתוכנן?" defaultOpen>
          {[
            { key: 'reg1', label: 'המפגשים התקיימו באופן סדיר', sub: 'מעל 80%=מצוין | 60–80%=מספק | מתחת 60%=בעייתי' },
            { key: 'reg2', label: 'כל קהל היעד השתתף בכל המפגשים', sub: 'במידה והיו ביטולים / נשירה — פרטו את הסיבות בהערות' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="scale-item">
              <div className="scale-label">{label}{sub && <span className="scale-sub">{sub}</span>}</div>
              <ScaleWidget scaleKey={key} value={scales[key]} onChange={setScale} />
            </div>
          ))}
          <span className="nl">הערות סדירות:</span>
          <textarea className="na" value={notes.n5} onChange={e => setNote('n5', e.target.value)} placeholder="מספר מפגשים שהתקיימו, סיבות לביטולים..." />
        </Section>

        {/* איכות הביצוע */}
        <Section icon="🌟" iconBg="#fef3e2" title="איכות הביצוע" desc="האם התוכנית מופעלת כראוי?">
          {[
            { key: 'qu1', label: 'תכנון המפגשים' },
            { key: 'qu2', label: 'התאמת המנחה לרציונל התוכנית', sub: 'מיומנויות, גישה פדגוגית, קשר עם תלמידים' },
            { key: 'qu3', label: 'מטרות התוכנית מיושמות' },
            { key: 'qu4', label: 'מידת שביעות רצון התלמידים גבוהה' },
            { key: 'qu5', label: 'המורים המעורבים בתוכנית מביעים שביעות רצון גבוהה' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="scale-item">
              <div className="scale-label">{label}{sub && <span className="scale-sub">{sub}</span>}</div>
              <ScaleWidget scaleKey={key} value={scales[key]} onChange={setScale} />
            </div>
          ))}
          <span className="nl">הערות איכות:</span>
          <textarea className="na" value={notes.n6} onChange={e => setNote('n6', e.target.value)} placeholder="מה עובד טוב? מה בעייתי?" />
        </Section>

        {/* סימני התקדמות — 2 סעיפים */}
        <Section icon="📈" iconBg="#e8eef8" title="סימני התקדמות — מדידת ביניים" desc="האם ישנם סימנים ראשוניים לשינוי?">
          {[
            { key: 'pr1', label: 'קיימות עדויות לשינוי המצביעות על שיפור בתחום הנבחר במסגרת התוכנית' },
            { key: 'pr2', label: 'תשתיות ומשאבים מספיקים להמשך הפעלת התוכנית' },
          ].map(({ key, label }) => (
            <div key={key} className="scale-item">
              <div className="scale-label">{label}</div>
              <ScaleWidget scaleKey={key} value={scales[key]} onChange={setScale} />
            </div>
          ))}
          <span className="nl">עדויות לשינוי + פעולות לשיפור:</span>
          <textarea className="na" value={notes.n7} onChange={e => setNote('n7', e.target.value)} placeholder="מה השתנה עד כה? מה עוד ניתן לעשות?" />
        </Section>
      </div>

      <BottomNav phaseIndex={1} score={scores[1]} onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
