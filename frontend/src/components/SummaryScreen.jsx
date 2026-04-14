import { Topbar } from './Topbar';
import { Section } from './Section';
import { BottomNav } from './BottomNav';
import { generateInsights } from '../constants/scoreCalc';

export function SummaryScreen({ eval: ev, onPrev, active }) {
  const { userName, userCode, userSchool, fields, notes, setNote,
          decision, setDecision, scores, save, saving, collectData } = ev;

  const data = collectData();
  const { insights, actions, dataRecs } = generateInsights(data, scores);

  function handlePrint() {
    const d = data;
    const sc = d.scales || {};
    const chk = id => d.checks?.[id] ? '☑' : '☐';
    const scLabel = key => {
      const v = sc[key];
      if (!v) return '—';
      const bars = ['','🔴 נמוך מאוד (1)','🟠 נמוך (2)','🟡 בינוני (3)','🟢 גבוה (4)'];
      return bars[v] || '—';
    };
    const decMap = { continue: '✅ להמשיך כמו שהוא', modify: '🔄 להמשיך עם שינויים', replace: '🔁 להחליף בתוכנית אחרת', stop: '❌ לא להמשיך' };

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>דוח הערכת תוכנית — ${d.fields?.['f-prog'] || 'ללא שם'}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; direction:rtl; color:#1e293b; font-size:13px; background:#f0f4f8; }
  .page { max-width:800px; margin:0 auto; background:white; padding:32px; }
  .header { background:linear-gradient(135deg,#1a2744,#0d7c66); color:white; border-radius:12px; padding:20px 24px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:20px; margin-bottom:4px; }
  .header .sub { font-size:11px; opacity:0.8; }
  .score-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
  .score-card { border-radius:12px; padding:16px; text-align:center; border:2px solid #e0e6ed; background:#f8fafc; }
  .score-card .val { font-size:32px; font-weight:900; }
  .score-card .lbl { font-size:11px; color:#6b7280; margin-top:4px; }
  .section { margin-bottom:20px; border-radius:10px; overflow:hidden; border:1px solid #e0e6ed; }
  .section-title { background:#e8f5f2; color:#0d7c66; font-weight:bold; font-size:13px; padding:10px 16px; border-right:4px solid #0d7c66; }
  .section-body { padding:12px 16px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .field { background:#f8fafc; border:1px solid #e0e6ed; border-radius:8px; padding:8px 12px; }
  .field label { display:block; font-size:10px; color:#6b7280; margin-bottom:2px; }
  .field span { font-weight:bold; font-size:13px; }
  .subsection { font-size:11px; font-weight:bold; color:#1a2744; background:#f1f5f9; padding:6px 12px; margin:8px -16px; }
  .ci { padding:5px 0; border-bottom:1px solid #f0f4f8; font-size:12px; display:flex; align-items:center; gap:6px; }
  .ci:last-child { border-bottom:none; }
  .scale-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f0f4f8; font-size:12px; }
  .scale-row:last-child { border-bottom:none; }
  .note-box { background:#f8fafc; border-right:3px solid #0d7c66; padding:8px 12px; margin:8px 0; font-size:12px; white-space:pre-wrap; border-radius:0 6px 6px 0; }
  .note-label { font-weight:bold; color:#0d7c66; margin-bottom:4px; font-size:11px; }
  .insight-box { border-radius:10px; padding:14px 16px; margin-bottom:12px; }
  .insight-box.green { background:#e8f5f2; border:1px solid #0d7c66; }
  .insight-box.amber { background:#fef3e0; border:1px solid #e67e22; }
  .insight-box.navy { background:#eef1f8; border:1px solid #1a2744; }
  .insight-box h4 { font-size:12px; font-weight:bold; margin-bottom:8px; }
  .insight-box.green h4 { color:#0d7c66; }
  .insight-box.amber h4 { color:#e67e22; }
  .insight-box.navy h4 { color:#1a2744; }
  .insight-box ul { padding-right:16px; }
  .insight-box li { font-size:12px; margin-bottom:4px; }
  .decision-box { background:#e8f5f2; border:2px solid #0d7c66; border-radius:10px; padding:14px 18px; margin:10px 0; font-size:15px; font-weight:bold; color:#0d7c66; text-align:center; }
  .footer { margin-top:24px; font-size:10px; color:#aaa; text-align:center; border-top:1px solid #eee; padding-top:12px; }
  @media print {
    body { background:white; }
    .page { padding:15px; }
    .section { break-inside:avoid; }
  }
</style>
</head>
<body>
<div class="page">

<div class="header">
  <div>
    <h1>📋 דוח הערכת תוכנית חינוכית</h1>
    <div class="sub">מחוז חיפה | משרד החינוך | ${new Date().toLocaleDateString('he-IL')}</div>
  </div>
  <div style="text-align:left; font-size:12px; opacity:0.9;">
    <div><b>${d.userSchool || '—'}</b></div>
    <div>סמל מוסד: ${d.userName || '—'}</div>
    <div>תוכנית: ${d.fields?.['f-prog'] || '—'}</div>
  </div>
</div>

<div class="score-row">
  <div class="score-card"><div class="val" style="color:#1a2744">${scores[0]}%</div><div class="lbl">שלב א׳ — הכנה</div></div>
  <div class="score-card"><div class="val" style="color:#0d7c66">${scores[1]}%</div><div class="lbl">שלב ב׳ — מהלך</div></div>
  <div class="score-card"><div class="val" style="color:#e67e22">${scores[2]}%</div><div class="lbl">שלב ג׳ — תוצאות</div></div>
</div>

<div class="section">
  <div class="section-title">📌 פרטי התוכנית</div>
  <div class="section-body">
    <div class="grid2">
      <div class="field"><label>שם התוכנית</label><span>${d.fields?.['f-prog'] || '—'}</span></div>
      <div class="field"><label>שנת לימודים</label><span>${d.fields?.['f-year'] || '—'}</span></div>
      <div class="field"><label>סמל מוסד</label><span>${d.userName || '—'}</span></div>
      <div class="field"><label>שם בית הספר</label><span>${d.userSchool || '—'}</span></div>
      <div class="field"><label>וותק התוכנית</label><span>${d.fields?.['f-seniority'] || '—'}</span></div>
      <div class="field"><label>קהל יעד</label><span>${d.fields?.['f-target'] || '—'}</span></div>
      <div class="field"><label>יעדי התוכנית</label><span>${d.fields?.['f-domain'] || '—'}${d.fields?.['f-domain-other'] ? ' — ' + d.fields['f-domain-other'] : ''}</span></div>
      <div class="field"><label>תחום</label><span>${d.fields?.['f-area'] || '—'}${d.fields?.['f-area-other'] ? ' — ' + d.fields['f-area-other'] : ''}</span></div>
      <div class="field"><label>מספר תלמידים</label><span>${d.fields?.['f-num'] || '—'}</span></div>
      <div class="field"><label>מספר אנשי צוות</label><span>${d.fields?.['f-contact'] || '—'}</span></div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">✅ שלב א׳ — טרום תוכנית</div>
  <div class="section-body">
    <div class="subsection">מיפוי צרכים</div>
    ${['c1','c2','c3','c4','c5'].map((c,i) => {
      const labels = ['הושלם תהליך מיפוי תמונת מצב בית ספרית','אותרו צרכים בית ספריים לקידום','הצורך התבסס על נתונים פנימיים וחיצוניים','צוות הניהול היה שותף לזיהוי הצורך ואישר את הבחירה','הושלם סטטוס של אוכלוסיית היעד לקראת הפעלת התוכנית'];
      const checked = d.checks?.[c];
      return `<div class="ci"><span style="font-size:15px">${checked ? '✅' : '⬜'}</span><span>${labels[i]}</span></div>`;
    }).join('')}
    <div class="subsection">בחירת התוכנית | הלימה: ${scLabel('fit')}</div>
    ${['c6','c7','c8'].map((c,i) => {
      const labels = ['נבדקו תוכניות חלופיות לפני הבחירה הסופית','קיבלנו המלצות מבתי ספר אחרים שהפעילו את התוכנית','אין חפיפה עם תוכנית קיימת אחרת'];
      const checked = d.checks?.[c];
      return `<div class="ci"><span style="font-size:15px">${checked ? '✅' : '⬜'}</span><span>${labels[i]}</span></div>`;
    }).join('')}
    <div class="subsection">משאבים ותשתית</div>
    ${['c9','c10','c11','c12','c13'].map((c,i) => {
      const labels = ['שעות להפעלת התוכנית מעוגנות במערכת הבית ספרית','הותאמו תשתיות הנדרשות ליישום התוכנית','הוגדר אחראי מטעם בית הספר והוגדרו תחומי אחריותו','הוגדר קהל היעד — מספר תלמידים ומאפיינים','הוגדר משאב תקציבי ואושר על ידי מפקחת בית הספר'];
      const checked = d.checks?.[c];
      return `<div class="ci"><span style="font-size:15px">${checked ? '✅' : '⬜'}</span><span>${labels[i]}</span></div>`;
    }).join('')}
    <div class="subsection">מדדי הערכה</div>
    ${['c14','c15','c16','c17','c18'].map((c,i) => {
      const labels = ['נקבעו מדדי סדירות','נקבעו מדדי תפוקה','נבחרו כלי הערכה ספציפיים','נקבעו צמתי הערכה בלוח השנה','נקבע יעד ספציפי ומדיד להגדרת ההצלחה'];
      const checked = d.checks?.[c];
      return `<div class="ci"><span style="font-size:15px">${checked ? '✅' : '⬜'}</span><span>${labels[i]}</span></div>`;
    }).join('')}
  </div>
</div>

<div class="section">
  <div class="section-title">📊 שלב ב׳ — במהלך התוכנית</div>
  <div class="section-body">
    <div class="subsection">סדירות</div>
    <div class="scale-row"><span>המפגשים התקיימו באופן סדיר</span><span>${scLabel('reg1')}</span></div>
    <div class="scale-row"><span>כל קהל היעד השתתף בכל המפגשים</span><span>${scLabel('reg2')}</span></div>
    <div class="subsection">איכות</div>
    <div class="scale-row"><span>תכנון המפגשים</span><span>${scLabel('qu1')}</span></div>
    <div class="scale-row"><span>התאמת המנחה לרציונל התוכנית</span><span>${scLabel('qu2')}</span></div>
    <div class="scale-row"><span>מטרות התוכנית מיושמות</span><span>${scLabel('qu3')}</span></div>
    <div class="scale-row"><span>מידת שביעות רצון התלמידים גבוהה</span><span>${scLabel('qu4')}</span></div>
    <div class="scale-row"><span>המורים המעורבים בתוכנית מביעים שביעות רצון גבוהה</span><span>${scLabel('qu5')}</span></div>
    <div class="subsection">התקדמות</div>
    <div class="scale-row"><span>קיימות עדויות לשינוי המצביעות על שיפור בתחום הנבחר</span><span>${scLabel('pr1')}</span></div>
    <div class="scale-row"><span>תשתיות ומשאבים מספיקים להמשך הפעלת התוכנית</span><span>${scLabel('pr2')}</span></div>
    ${d.notes?.n7 ? `<div class="note-box"><div class="note-label">💬 עדויות לשינוי</div>${d.notes.n7}</div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">🏆 שלב ג׳ — הערכת סוף תוכנית</div>
  <div class="section-body">
    <div class="scale-row"><span>הושג שיפור בתחום הנבחר במסגרת התוכנית</span><span>${scLabel('out1')}</span></div>
    <div class="scale-row"><span>שביעות הרצון של קהל היעד המשתתף בתוכנית גבוהה</span><span>${scLabel('out2')}</span></div>
    <div class="scale-row"><span>התוצאות שהושגו מצביעות על כדאיות ההשקעה בתוכנית</span><span>${scLabel('out4')}</span></div>
    ${d.notes?.n9 ? `<div class="note-box"><div class="note-label">❌ מה לא עבד</div>${d.notes.n9}</div>` : ''}
    ${d.notes?.n10 ? `<div class="note-box"><div class="note-label">✅ מה עבד טוב</div>${d.notes.n10}</div>` : ''}
    ${d.notes?.n11 ? `<div class="note-box"><div class="note-label">💡 המלצה לשנה הבאה</div>${d.notes.n11}</div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">💡 תובנות אוטומטיות ודרכי פעולה</div>
  <div class="section-body">
    <div class="insight-box green">
      <h4>💡 תובנות אוטומטיות</h4>
      <ul>${insights.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    ${actions.length ? `
    <div class="insight-box amber">
      <h4>🛠️ דרכי פעולה מומלצות</h4>
      <ul>${actions.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>` : ''}
    ${dataRecs.length ? `
    <div class="insight-box navy">
      <h4>📊 דרכי שיפור הנתונים</h4>
      <ul>${dataRecs.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">🔮 סיכום והחלטה</div>
  <div class="section-body">
    ${d.decision ? `<div class="decision-box">החלטה: ${decMap[d.decision] || d.decision}</div>` : '<div style="color:#aaa;font-size:12px">לא נבחרה החלטה</div>'}
    ${d.notes?.n12 ? `<div class="note-box"><div class="note-label">📝 הנמקה</div>${d.notes.n12}</div>` : ''}
    ${d.notes?.n13 ? `<div class="note-box"><div class="note-label">📋 הערות כלליות</div>${d.notes.n13}</div>` : ''}
  </div>
</div>

<div class="footer">נוצר על ידי כלי הערכת תוכניות חינוכיות | מחוז חיפה | ${new Date().toLocaleString('he-IL')}</div>
</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      alert('הדפדפן חסם את פתיחת החלון. אנא אפשרי חלונות קופצים לאתר זה ונסי שוב.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 800);
  }

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

        {/* כרטיסי ציון */}
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

        {/* תובנות */}
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

        {/* החלטה */}
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

        {/* הערות כלליות */}
        <Section icon="📝" iconBg="#e8f5f2" title="הערות סיכום כלליות" defaultOpen>
          <textarea className="na" style={{ minHeight: 100 }} value={notes.n13}
                    onChange={e => setNote('n13', e.target.value)} placeholder="סיכום כולל של הערכת התוכנית..." />
        </Section>

        {/* כפתורים */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn-main" style={{ maxWidth: 320 }} onClick={() => save(true)} disabled={saving}>
            💾 שמור והגש הערכה סופית
          </button>
          <button className="btn-main" style={{ maxWidth: 260, background: 'linear-gradient(135deg,#1a2744,#243052)' }}
                  onClick={handlePrint}>
            📄 הדפס / הורד דוח
          </button>
        </div>
      </div>

      <BottomNav phaseIndex={3} score={null} onPrev={onPrev} onNext={null} showPrev={true} nextLabel="" />
    </div>
  );
}
