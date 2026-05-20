import { useState } from 'react';
import { Topbar } from './Topbar';
import { Section } from './Section';
import { BottomNav } from './BottomNav';
import { TARGET_OPTIONS, SENIORITY_OPTIONS, GOAL_OPTIONS, DOMAIN_OPTIONS } from '../constants/formFields';

export function PhaseAScreen({ eval: ev, onNext, onNavigate, active }) {
  const { userName, userCode, userSchool, fields, setField, checks, setCheck,
          notes, setNote, scores, save, saving } = ev;
  const [targetOpen, setTargetOpen] = useState(false);

  const checkboxes1 = [
    { id: 'c1', label: 'הושלם תהליך מיפוי תמונת מצב בית ספרית' },
    { id: 'c2', label: 'אותרו צרכים בית ספריים לקידום' },
    { id: 'c3', label: 'הצורך התבסס על נתונים פנימיים וחיצוניים' },
    { id: 'c4', label: 'צוות הניהול היה שותף לזיהוי הצורך ואישר את הבחירה' },
    { id: 'c5', label: 'הושלם סטטוס של אוכלוסיית היעד לקראת הפעלת התוכנית' },
  ];
  const checkboxes2 = [
    { id: 'c19', label: 'הלימה בין מטרות התוכנית לצורך הבית-ספרי' },
    { id: 'c6',  label: 'נבדקו תוכניות חלופיות לפני הבחירה הסופית' },
    { id: 'c7',  label: 'קיבלנו המלצות מבתי ספר אחרים שהפעילו את התוכנית' },
    { id: 'c8',  label: 'אין חפיפה עם תוכנית קיימת אחרת בבית הספר' },
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

  const selectedTargets = fields['f-target']
    ? fields['f-target'].split(',').map(s => s.trim()).filter(Boolean)
    : [];

  function toggleTarget(option) {
    const updated = selectedTargets.includes(option)
      ? selectedTargets.filter(o => o !== option)
      : [...selectedTargets, option];
    setField('f-target', updated.join(', '));
  }

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={0} scores={scores}
              onSave={() => save(true)} saving={saving} onNavigate={onNavigate} />

      <div className="phase-content">
        <div className="ph-banner p1">
          <div>
            <h3>שלב א׳ — טרום תוכנית <small style={{ fontWeight: 400, opacity: 0.7 }}>(מאי–יוני)</small></h3>
            <p>מיפוי צרכים, בחירת תוכנית, תכנון מערך ההערכה.</p>
          </div>
        </div>

        <Section title="פרטי התוכנית" desc="מלאו לפני תחילת ההערכה" defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            <div className="fg" style={{ margin: 0 }}>
              <label>שם התוכנית *</label>
              <input value={fields['f-prog']} onChange={e => setField('f-prog', e.target.value)} placeholder="שם התוכנית" />
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label>שנת לימודים</label>
              <input value={fields['f-year']} onChange={e => setField('f-year', e.target.value)} placeholder="תשפ״ו" />
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label>וותק התוכנית בבית הספר</label>
              <select value={fields['f-seniority']} onChange={e => setField('f-seniority', e.target.value)}>
                <option value="">בחר וותק</option>
                {SENIORITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label>יעדי התוכנית</label>
              <select value={fields['f-domain']} onChange={e => setField('f-domain', e.target.value)}>
                <option value="">בחר יעד</option>
                {GOAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {fields['f-domain'] === 'אחר' && (
                <input value={fields['f-domain-other']} onChange={e => setField('f-domain-other', e.target.value)}
                  placeholder="פרט/י..." style={{ marginTop: 8, width: '100%', border: '2px solid var(--border)',
                  borderRadius: 10, padding: '10px 13px', fontFamily: 'Heebo', fontSize: '0.93rem', background: 'var(--gray-light)' }} />
              )}
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label>תחום</label>
              <select value={fields['f-area']} onChange={e => setField('f-area', e.target.value)}>
                <option value="">בחר תחום</option>
                {DOMAIN_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {fields['f-area'] === 'אחר' && (
                <input value={fields['f-area-other']} onChange={e => setField('f-area-other', e.target.value)}
                  placeholder="פרט/י..." style={{ marginTop: 8, width: '100%', border: '2px solid var(--border)',
                  borderRadius: 10, padding: '10px 13px', fontFamily: 'Heebo', fontSize: '0.93rem', background: 'var(--gray-light)' }} />
              )}
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label>מספר אנשי צוות</label>
              <input type="number" value={fields['f-contact']} onChange={e => setField('f-contact', e.target.value)} placeholder="מספר" />
            </div>
            <div className="fg" style={{ margin: 0 }}>
              <label>מספר תלמידים</label>
              <input type="number" value={fields['f-num']} onChange={e => setField('f-num', e.target.value)} placeholder="מספר" />
            </div>
          </div>

          {/* קהל יעד — dropdown עם checkboxes */}
          <div className="fg" style={{ margin: '12px 0 0', position: 'relative' }}>
            <label>קהל יעד</label>
            <div
              onClick={() => setTargetOpen(!targetOpen)}
              style={{
                width: '100%', border: '2px solid var(--border)', borderRadius: 10,
                padding: '11px 13px', fontFamily: 'Heebo', fontSize: '0.93rem',
                background: 'var(--gray-light)', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: selectedTargets.length > 0 ? '#1e293b' : '#9ca3af'
              }}>
              <span>{selectedTargets.length > 0 ? selectedTargets.join(', ') : 'בחר כיתה / שכבה'}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{targetOpen ? '▲' : '▼'}</span>
            </div>
            {targetOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 100,
                background: 'white', border: '2px solid var(--teal)', borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 280, overflowY: 'auto'
              }}>
                {TARGET_OPTIONS.map(group => (
                  <div key={group.group}>
                    <div style={{ padding: '8px 14px', fontSize: '0.72rem', fontWeight: 700,
                                  color: 'var(--gray)', background: 'var(--gray-light)',
                                  borderBottom: '1px solid var(--border)' }}>
                      {group.group}
                    </div>
                    {group.options.map(option => {
                      const isSelected = selectedTargets.includes(option);
                      return (
                        <div key={option}
                          onClick={e => { e.stopPropagation(); toggleTarget(option); }}
                          style={{
                            padding: '10px 14px', cursor: 'pointer', fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: isSelected ? 'var(--teal-light)' : 'white',
                            borderBottom: '1px solid var(--border)',
                            color: isSelected ? 'var(--teal)' : '#1e293b',
                            fontWeight: isSelected ? 700 : 400,
                          }}>
                          <span style={{
                            width: 16, height: 16, border: `2px solid ${isSelected ? 'var(--teal)' : 'var(--border)'}`,
                            borderRadius: 4, background: isSelected ? 'var(--teal)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: '0.7rem', color: 'white'
                          }}>
                            {isSelected ? '✓' : ''}
                          </span>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div style={{ padding: '8px 14px', textAlign: 'center' }}>
                  <button onClick={() => setTargetOpen(false)}
                    style={{ padding: '6px 20px', background: 'var(--teal)', color: 'white',
                             border: 'none', borderRadius: 8, fontFamily: 'Heebo',
                             fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                    סגור
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

        <div className="progress-wrap">
          <div className="progress-lbl">התקדמות שלב א׳</div>
          <div className="pb-outer"><div className="pb-inner" style={{ width: `${scores[0]}%` }} /></div>
          <div className="pb-num">{scores[0]}%</div>
        </div>

        <Section title="מיפוי צרכים בית-ספרי" desc="זיהוי הצורך המרכזי" defaultOpen>
          {checkboxes1.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">הצורך המרכזי שזוהה:</span>
          <textarea className="na" value={notes.n1} onChange={e => setNote('n1', e.target.value)} placeholder="תארו את הצורך..." />
        </Section>

        <Section title="בחירת התוכנית והלימה לצורך" desc="האם התוכנית שנרכשה מתאימה לצורך?">
          {checkboxes2.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">הסבר על ההלימה:</span>
          <textarea className="na" value={notes.n2} onChange={e => setNote('n2', e.target.value)} placeholder="כיצד התוכנית עונה על הצורך?" />
        </Section>

        <Section title="משאבים ותשתית" desc="כוח אדם, שעות, ציוד, תקציב">
          {checkboxes3.map(c => (
            <div key={c.id} className="ci">
              <input type="checkbox" id={c.id} checked={!!checks[c.id]} onChange={e => setCheck(c.id, e.target.checked)} />
              <label htmlFor={c.id}>{c.label}</label>
            </div>
          ))}
          <span className="nl">פרטי משאבים:</span>
          <textarea className="na" value={notes.n3} onChange={e => setNote('n3', e.target.value)} placeholder="כוח אדם, שעות שבועיות, תקציב..." />
        </Section>

        <Section title="מדדי הערכה וצמתי מעקב" desc="תכנון מראש של מה, מתי ואיך מודדים">
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
