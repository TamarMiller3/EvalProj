import { Topbar } from './Topbar';
import { Section } from './Section';
import { ScaleWidget } from './ScaleWidget';
import { BottomNav } from './BottomNav';
import { TARGET_OPTIONS, SENIORITY_OPTIONS, GOAL_OPTIONS, DOMAIN_OPTIONS, FIT_NOTES } from '../constants/formFields';

export function PhaseAScreen({ eval: ev, onNext, active }) {
  const { userName, userCode, userSchool, fields, setField, checks, setCheck,
          scales, setScale, notes, setNote, scores, save, saving } = ev;

  const fitNote = scales.fit ? FIT_NOTES[scales.fit] : null;

  const checkboxes1 = [
    { id: 'c1', label: 'הושלם תהליך מיפוי תמונת מצב בית ספרית' },
    { id: 'c2', label: 'אותרו צרכים בית ספריים לקידום' },
    { id: 'c3', label: 'הצורך התבסס על נתונים פנימיים וחיצוניים' },
    { id: 'c4', label: 'צוות הניהול היה שותף לזיהוי הצורך ואישר את הבחירה' },
    { id: 'c5', label: 'הושלם סטטוס של אוכלוסיית היעד לקראת הפעלת התוכנית' },
  ];
  const checkboxes2 = [
    { id: 'c6', label: 'נבדקו תוכניות חלופיות לפני הבחירה הסופית' },
    { id: 'c7', label: 'קיבלנו המלצות מבתי ספר אחרים שהפעילו את התוכנית' },
    { id: 'c8', label: 'אין חפיפה עם תוכנית קיימת אחרת בבית הספר' },
  ];
  const checkboxes3 = [
    { id: 'c9',  label: 'שעות להפעלת התוכנית מעוגנות במערכת הבית ספרית' },
    { id: 'c10', label: 'הותאמו תשתיות הנדרשות ליישום התוכנית (מיקום ומשאבים)' },
    { id: 'c11', label: 'הוגדר אחראי מטעם בית הספר והוגדרו תחומי אחריותו' },
    { id: 'c12', label: 'הוגדר קהל היעד — מספר תלמידים ומאפיינים' },
    { id: 'c13', label: 'הוגדר משאב תקציבי ואושר על ידי מפקחת בית הספר' },
  ];
  const checkboxes4 = [
    { id: 'c14', label: 'נקבעו מדדי סדירות: מספר מפגשים, אחוז נוכחות' },
    { id: 'c15', label: 'נקבעו מדדי תפוקה: שיפור הישגים / רגשי / חברתי' },
    { id: 'c16', label: 'נבחרו כלי הערכה ספציפיים (שאלון, מבחן, ראיון, תצפית)' },
    { id: 'c17', label: 'נקבעו צמתי הערכה בלוח השנה' },
    { id: 'c18', label: 'נקבע יעד ספציפי ומדיד להגדרת ההצלחה' },
  ];

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={0} scores={scores} onSave={() => save(true)} saving={saving} />

      <div className="phase-content">
        <div className="ph-banner p1">
          <span style={{ fontSize: '1.5rem' }}>🔍</span>
          <div>
            <h3>שלב א׳ — טרום תוכנית <small style={{ fontWeight: 400, opacity: 0.7 }}>(מאי–יוני)</small></h3>
            <p>מיפוי צרכים, בחירת תוכנית, תכנון מערך ההערכה.</p>
          </div>
        </div>

        {/* פרטי התוכנית */}
        <Section icon="📋" iconBg="#e8eef8" title="פרטי התוכנית" desc="מלאו לפני תחילת ההערכה" defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {/* שם התוכנית */}
            <div className="fg" style={{ margin: 0 }}>
              <label>שם התוכנית *</label>
              <input value={fields['f-prog']} onChange={e => setField('f-prog', e.target.value)} placeholder="שם התוכנית" />
            </div>
            {/* שנת לימודים */}
            <div className="fg" style={{ margin: 0 }}>
              <label>שנת לימודים</label>
              <input value={fields['f-year']} onChange={e => setField('f-year', e.target.value)} placeholder="תשפ״ו" />
            </div>
            {/* וותק */}
            <div className="fg" style={{ margin: 0 }}>
              <label>וותק התוכנית בבית הספר</label>
              <select value={fields['f-seniority']} onChange={e => setField('f-seniority', e.target.value)}>
                <option value="">בחר וותק</option>
                {SENIORITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {/* קהל יעד */}
            <div className="fg" style={{ margin: 0 }}>
              <label>קהל יעד</label>
              <select value={fields['f-target']} onChange={e => setField('f-target', e.target.value)}>
                <option value="">בחר כיתה / שכבה</option>
                {TARGET_OPTIONS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map(o => <option key={o}>{o}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            {/* יעדי התוכנית */}
            <div className="fg" style={{ margin: 0 }}>
              <label>יעדי התוכנית</label>
              <select value={fields['f-domain']} onChange={e => setField('f-domain', e.target.value)}>
                <option value="">בחר יעד</option>
                {GOAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {fields['f-domain'] === 'אחר' && (
                <input
                  value={fields['f-domain-other']}
                  onChange={e => setField('f-domain-other', e.target.value)}
                  placeholder="פרט/י את יעד התוכנית..."
                  style={{ marginTop: 8, width: '100%', border: '2px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontFamily: 'Heebo', fontSize: '0.93rem', background: 'var(--gray-light)' }}
                />
              )}
            </div>
            {/* תחום */}
            <div className="fg" style={{ margin: 0 }}>
              <label>תחום</label>
              <select value={fields['f-area']} onChange={e => setField('f-area', e.target.value)}>
                <option value="">בחר תחום</option>
                {DOMAIN_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {fields['f-area'] === 'אחר' && (
                <input
                  value={fields['f-area-other']}
                  onChange={e => setField('f-area-other', e.target.value)}
                  placeholder="פרט/י את התחום..."
                  style={{ marginTop: 8, width: '100%', border: '2px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontFamily: 'Heebo', fontSize: '0.93rem', background: 'var(--gray-light)' }}
                />
              )}
            </div>
            {/* מספר אנשי צוות */}
            <div className="fg" style={{ margin: 0 }}>
              <label>מספר אנשי צוות המקדמים את יישום התוכנית</label>
              <input type="number" value={fields['f-contact']} onChange={e => setField('f-contact', e.target.value)} placeholder="מספר אנשי צוות" />
            </div>
            {/* מספר תלמידים */}
            <div className="fg" style={{ margin: 0 }}>
              <label>מספר תלמידים</label>
              <input type="number" value={fields['f-num']} onChange={e => setField('f-num', e.target.value)} placeholder="מספר" />
            </div>
          </div>
        </Section>

        {/* סרגל התקדמות */}
        <div className="progress-wrap">
          <div className="progress-lbl">התקדמות שלב א׳</div>
          <div className="pb-outer"><div className="pb-inner" style={{ width: `${scores[0]}%` }} /></div>
          <div className="pb-num">{scores[0]}%</div>
        </div>

        {/* מיפוי צרכים */}
        <Section icon="🏫" iconBg="#e8eef8" title="מיפוי צרכים בית-ספרי" desc="זיהוי הצורך המרכזי" defaultOpen>
          {checkboxes1.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">הצורך המרכזי שזוהה:</span>
          <textarea className="na" value={notes.n1} onChange={e => setNote('n1', e.target.value)} placeholder="תארו את הצורך..." />
        </Section>

        {/* בחירת התוכנית והלימה */}
        <Section icon="✅" iconBg="#eafaf1" title="בחירת התוכנית והלימה לצורך" desc="האם התוכנית שנרכשה מתאימה לצורך?">
          {/* מקרא סולם */}
          <div className="sleg" style={{ marginBottom: 12 }}>
            {[
              { n: 1, color: '#e74c3c', label: 'כלל לא' },
              { n: 2, color: '#e67e22', label: 'במידה חלקית' },
              { n: 3, color: '#f1c40f', label: 'במידה רבה' },
              { n: 4, color: '#27ae60', label: 'במידה רבה מאוד' },
            ].map(({ n, color, label }) => (
              <div key={n} className="sli">
                <div className="slid" style={{ background: color }} />
                {n} = {label}
              </div>
            ))}
          </div>

          {/* סולם הלימה */}
          <div className="scale-item">
            <div className="scale-label">
              הלימה בין מטרות התוכנית לצורך הבית-ספרי
              <span className="scale-sub">עד כמה מטרות התוכנית עונות על הצורך שזוהה?</span>
            </div>
            <ScaleWidget scaleKey="fit" value={scales.fit} onChange={setScale} />
          </div>

          {/* הערה דינמית לפי ציון */}
          {fitNote && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 8,
              background: fitNote.bg, borderRight: `4px solid ${fitNote.border}`,
              color: fitNote.color, fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.6
            }}>
              {fitNote.text}
            </div>
          )}

          {checkboxes2.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">הסבר על ההלימה:</span>
          <textarea className="na" value={notes.n2} onChange={e => setNote('n2', e.target.value)} placeholder="כיצד התוכנית עונה על הצורך?" />
        </Section>

        {/* משאבים ותשתית */}
        <Section icon="⚙️" iconBg="#fef3e2" title="משאבים ותשתית" desc="כוח אדם, שעות, ציוד, תקציב">
          {checkboxes3.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">פרטי משאבים:</span>
          <textarea className="na" value={notes.n3} onChange={e => setNote('n3', e.target.value)} placeholder="כוח אדם, שעות שבועיות, תקציב..." />
        </Section>

        {/* מדדי הערכה */}
        <Section icon="📐" iconBg="#f3e8fd" title="מדדי הערכה וצמתי מעקב" desc="תכנון מראש של מה, מתי ואיך מודדים">
          {checkboxes4.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">פירוט מדדים ויעדים:</span>
          <textarea className="na" value={notes.n4} onChange={e => setNote('n4', e.target.value)} placeholder="למשל: 80% נוכחות, עלייה ב-10% בציוני קריאה..." />
        </Section>
      </div>

      <BottomNav phaseIndex={0} score={scores[0]} showPrev={false} onNext={onNext} />
    </div>
  );
}
