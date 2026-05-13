import { Topbar } from './Topbar';
import { Section } from './Section';
import { BottomNav } from './BottomNav';
import { generateInsights } from '../constants/scoreCalc';

export function SummaryScreen({ eval: ev, onPrev, onNavigate, active }) {
  const { userName, userCode, userSchool, fields, notes, setNote,
          decision, setDecision, scores, save, saving, collectData } = ev;

  const data = collectData();
  const { insights, actions, dataRecs } = generateInsights(data, scores);

  function handlePrint() {
    const d = data;
    const sc = d.scales || {};
    const chk = id => d.checks?.[id] ? '☑' : '☐';
    const scLabel = key => { const v = sc[key]; if (!v) return '—'; return ['','1','2','3','4'][v] || '—'; };
    const decMap = { continue: 'לשמר את הקיים', modify: 'להמשיך עם שינויים', replace: 'להחליף בתוכנית אחרת', stop: 'לא להמשיך' };

    const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8">
<title>דוח — ${d.fields?.['f-prog'] || ''}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;direction:rtl;font-size:13px;padding:30px;color:#1e293b}
h1{font-size:18px;color:#1a2744;border-bottom:3px solid #0d7c66;padding-bottom:8px;margin-bottom:16px}
h2{font-size:13px;color:#0d7c66;background:#e8f5f2;padding:6px 10px;border-right:4px solid #0d7c66;margin:16px 0 8px;border-radius:4px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.field{background:#f8fafc;border:1px solid #e0e6ed;border-radius:5px;padding:7px 10px}
.field label{display:block;font-size:10px;color:#6b7280;margin-bottom:2px}.field span{font-weight:bold}
.score-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
.sc{background:#f8fafc;border:2px solid #e0e6ed;border-radius:7px;padding:10px;text-align:center}
.sc .v{font-size:22px;font-weight:900}.sc .l{font-size:11px;color:#6b7280;margin-top:2px}
.ci{padding:3px 0;border-bottom:1px dashed #e0e6ed;font-size:12px}
.sr{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed #e0e6ed;font-size:12px}
.nb{background:#f8fafc;border:1px solid #e0e6ed;border-radius:5px;padding:7px 10px;margin:5px 0;font-size:12px;white-space:pre-wrap;min-height:30px}
.dec{background:#eafaf1;border:2px solid #0d7c66;border-radius:7px;padding:10px 14px;margin:12px 0;font-size:13px;font-weight:bold;color:#0d7c66}
.foot{margin-top:24px;font-size:10px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:8px}
@media print{body{padding:15px}}</style></head><body>
<h1>דוח הערכת תוכנית חינוכית</h1>
<div style="font-size:11px;color:#6b7280;margin-bottom:14px">מחוז חיפה | ${new Date().toLocaleDateString('he-IL')}</div>
<h2>פרטי התוכנית</h2>
<div class="grid2">
<div class="field"><label>שם התוכנית</label><span>${d.fields?.['f-prog']||'—'}</span></div>
<div class="field"><label>שנת לימודים</label><span>${d.fields?.['f-year']||'—'}</span></div>
<div class="field"><label>סמל מוסד</label><span>${d.userName||'—'}</span></div>
<div class="field"><label>שם בית הספר</label><span>${d.userSchool||'—'}</span></div>
<div class="field"><label>שם מנהל/ת</label><span>${d.userPrincipal||'—'}</span></div>
<div class="field"><label>וותק</label><span>${d.fields?.['f-seniority']||'—'}</span></div>
<div class="field"><label>קהל יעד</label><span>${d.fields?.['f-target']||'—'}</span></div>
<div class="field"><label>יעד</label><span>${d.fields?.['f-domain']||'—'}</span></div>
<div class="field"><label>תחום</label><span>${d.fields?.['f-area']||'—'}</span></div>
<div class="field"><label>תלמידים</label><span>${d.fields?.['f-num']||'—'}</span></div>
</div>
<h2>ציונים</h2>
<div class="score-row">
<div class="sc"><div class="v" style="color:#1a2744">${scores[0]}%</div><div class="l">שלב א׳ — הכנה</div></div>
<div class="sc"><div class="v" style="color:#0d7c66">${scores[1]}%</div><div class="l">שלב ב׳ — מהלך</div></div>
<div class="sc"><div class="v" style="color:#e67e22">${scores[2]}%</div><div class="l">שלב ג׳ — תוצאות</div></div>
</div>
<h2>שלב א׳</h2>
${['c1','c2','c3','c4','c5'].map((c,i)=>{const l=['מיפוי תמונת מצב','אותרו צרכים','נתונים פנימיים וחיצוניים','ניהול שותף','סטטוס אוכלוסיית יעד'];return`<div class="ci">${chk(c)} ${l[i]}</div>`;}).join('')}
${['c19','c6','c7','c8'].map((c,i)=>{const l=['הלימה בין מטרות לצורך','תוכניות חלופיות','המלצות מבתי ספר אחרים','אין חפיפה'];return`<div class="ci">${chk(c)} ${l[i]}</div>`;}).join('')}
${['c9','c10','c11','c12','c13'].map((c,i)=>{const l=['שעות מעוגנות','תשתיות הותאמו','אחראי הוגדר','קהל יעד הוגדר','תקציב אושר'];return`<div class="ci">${chk(c)} ${l[i]}</div>`;}).join('')}
${['c14','c15','c16','c17','c18'].map((c,i)=>{const l=['מדדי סדירות','מדדי תפוקה','כלי הערכה','צמתי הערכה','יעד מדיד'];return`<div class="ci">${chk(c)} ${l[i]}</div>`;}).join('')}
<h2>שלב ב׳</h2>
${[['reg1','מפגשים סדירים'],['reg2','קהל יעד השתתף'],['qu1','תכנון מפגשים'],['qu2','התאמת מנחה'],['qu3','מטרות מיושמות'],['qu4','שביעות רצון תלמידים'],['qu5','שביעות רצון מורים'],['pr1','עדויות לשינוי'],['pr2','תשתיות ומשאבים']].map(([k,l])=>`<div class="sr"><span>${l}</span><span>${scLabel(k)}</span></div>`).join('')}
${d.notes?.n7?`<div class="nb">${d.notes.n7}</div>`:''}
<h2>שלב ג׳</h2>
${[['out1','שיפור בתחום'],['out2','שביעות רצון'],['out4','כדאיות ההשקעה']].map(([k,l])=>`<div class="sr"><span>${l}</span><span>${scLabel(k)}</span></div>`).join('')}
${d.notes?.n9?`<div class="nb"><b>מה לא עבד:</b> ${d.notes.n9}</div>`:''}
${d.notes?.n10?`<div class="nb"><b>מה עבד:</b> ${d.notes.n10}</div>`:''}
${d.notes?.n11?`<div class="nb"><b>המלצה:</b> ${d.notes.n11}</div>`:''}
<h2>החלטה</h2>
${d.decision?`<div class="dec">${decMap[d.decision]||d.decision}</div>`:''}
${d.notes?.n12?`<div class="nb"><b>הנמקה:</b> ${d.notes.n12}</div>`:''}
${d.notes?.n13?`<div class="nb"><b>הערות:</b> ${d.notes.n13}</div>`:''}
<div class="foot">כלי הערכת תוכניות חינוכיות | מחוז חיפה | ${new Date().toLocaleString('he-IL')}</div>
</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    setTimeout(() => { iframe.contentWindow.print(); setTimeout(() => document.body.removeChild(iframe), 2000); }, 600);
  }

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={3} scores={scores}
              onSave={() => save(true)} saving={saving} onNavigate={onNavigate} />

      <div className="phase-content">
        <div className="ph-banner p4">
          <div>
            <h3>סיכום ולקחים</h3>
            <p>תמונה כוללת של הערכת התוכנית — ציונים, תובנות ומסקנות</p>
          </div>
        </div>

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

        <div className="rec-box">
          <h4>תובנות אוטומטיות</h4>
          <ul style={{ marginBottom: 12 }}>
            {insights.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <h4 style={{ color: '#b7800a', marginTop: 10 }}>דרכי פעולה מומלצות</h4>
          <ul style={{ marginBottom: 12 }}>
            {actions.length ? actions.map((t,i) => <li key={i}>{t}</li>)
              : <li style={{ listStyle:'none', color:'var(--gray)', fontStyle:'italic' }}>אין פריטים להצגה</li>}
          </ul>
          <h4 style={{ color: 'var(--navy)', marginTop: 10 }}>דרכי שיפור הנתונים</h4>
          <ul>
            {dataRecs.length ? dataRecs.map((t,i) => <li key={i}>{t}</li>)
              : <li style={{ listStyle:'none', color:'var(--gray)', fontStyle:'italic' }}>אין פריטים להצגה</li>}
          </ul>
        </div>

        <Section title="החלטה על המשך התוכנית" desc="סכמו את ההחלטה לאחר עיון בכל הנתונים" defaultOpen>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '12px 0' }}>
            {[
              { value: 'continue', label: 'לשמר את הקיים' },
              { value: 'modify',   label: 'להמשיך עם שינויים' },
              { value: 'replace',  label: 'להחליף בתוכנית אחרת' },
              { value: 'stop',     label: 'לא להמשיך' },
            ].map(opt => (
              <label key={opt.value} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.87rem', cursor:'pointer' }}>
                <input type="radio" name="decision" value={opt.value}
                       checked={decision === opt.value} onChange={() => setDecision(opt.value)}
                       style={{ accentColor: 'var(--teal)' }} />
                {opt.label}
              </label>
            ))}
          </div>
          <span className="nl">הנמקה:</span>
          <textarea className="na" value={notes.n12} onChange={e => setNote('n12', e.target.value)} placeholder="הנמקה מפורטת..." />
        </Section>

        <Section title="הערות סיכום כלליות" defaultOpen>
          <textarea className="na" style={{ minHeight: 100 }} value={notes.n13}
                    onChange={e => setNote('n13', e.target.value)} placeholder="סיכום כולל של הערכת התוכנית..." />
        </Section>

        <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:20, flexWrap:'wrap' }}>
          <button className="btn-main" style={{ maxWidth: 320 }} onClick={() => save(true)} disabled={saving}>
            שמור והגש הערכה סופית
          </button>
          <button className="btn-main" style={{ maxWidth: 260, background:'linear-gradient(135deg,#1a2744,#243052)' }}
                  onClick={handlePrint}>
            הדפס / הורד דוח
          </button>
        </div>
      </div>

      <BottomNav phaseIndex={3} score={null} onPrev={onPrev} onNext={null} showPrev={true} nextLabel="" />
    </div>
  );
}
