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
    const ch = d.checks || {};

    const chkBox = id => ch[id]
      ? `<span style="color:#0d7c66;font-weight:bold;font-size:14px">✓</span>`
      : `<span style="color:#ccc;font-size:14px">☐</span>`;

    const scaleBtn = (key) => {
      const v = sc[key];
      if (!v) return `<span style="color:#ccc;font-size:11px">לא נבחר</span>`;
      const colors = ['','#e74c3c','#e67e22','#f1c40f','#27ae60'];
      const textColors = ['','white','white','#5a4200','white'];
      return `<span style="background:${colors[v]};color:${textColors[v]};padding:3px 12px;border-radius:5px;font-weight:700;font-size:12px">${v}</span>`;
    };

    const noteBox = (text, placeholder) =>
      `<div style="background:#f8fafc;border:1px solid #e0e6ed;border-radius:6px;padding:8px 12px;font-size:12px;${text ? 'white-space:pre-wrap' : 'color:#bbb'};margin-top:4px;min-height:32px">${text || placeholder}</div>`;

    const ciRow = (id, label) =>
      `<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px dashed #e0e6ed;font-size:12px">
        <span style="flex-shrink:0;margin-top:1px">${chkBox(id)}</span><span>${label}</span></div>`;

    const scaleRow = (key, label, sub) =>
      `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed #e0e6ed">
        <div style="flex:1;font-size:12px;line-height:1.5">${label}${sub ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${sub}</div>` : ''}</div>
        <div style="flex-shrink:0">${scaleBtn(key)}</div>
      </div>`;

    const card = (title, desc, content) =>
      `<div style="background:white;border-radius:12px;box-shadow:0 2px 10px rgba(26,39,68,0.08);margin-bottom:14px;overflow:hidden">
        <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;background:white">
          <div style="font-weight:700;font-size:13px;color:#1a2744">${title}</div>
          ${desc ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${desc}</div>` : ''}
        </div>
        <div style="padding:10px 16px 14px">${content}</div>
      </div>`;

    const banner = (bg, border, title, sub) =>
      `<div style="border-radius:10px;padding:14px 18px;margin-bottom:16px;background:${bg};border-right:4px solid ${border}">
        <div style="font-size:14px;font-weight:700;color:#1a2744">${title}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:3px">${sub}</div>
      </div>`;

    const progressBar = (label, pct) =>
      `<div style="background:white;border-radius:8px;padding:10px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(26,39,68,0.07)">
        <div style="font-size:11px;font-weight:700;color:#1a2744;white-space:nowrap">${label}</div>
        <div style="flex:1;height:6px;background:#f3f4f6;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#0d7c66,#4fc3a1);border-radius:4px"></div>
        </div>
        <div style="font-size:12px;font-weight:700;color:#0d7c66;white-space:nowrap">${pct}%</div>
      </div>`;

    const legend = (labels) => {
      const l = labels || ['לא מתקיים','חלקי','מספק','מצוין'];
      const colors = ['#e74c3c','#e67e22','#f1c40f','#27ae60'];
      return `<div style="display:flex;gap:14px;background:#f3f4f6;border-radius:7px;padding:8px 12px;margin-bottom:12px;flex-wrap:wrap">
        ${l.map((t,i) => `<div style="display:flex;align-items:center;gap:5px;font-size:11px">
          <div style="width:10px;height:10px;border-radius:3px;background:${colors[i]}"></div>${i+1} = ${t}</div>`).join('')}
      </div>`;
    };

    const decMap = { continue: 'לשמר את הקיים', modify: 'להמשיך עם שינויים', replace: 'להחליף בתוכנית אחרת', stop: 'לא להמשיך' };

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8">
<title>דוח הערכת תוכנית — ${d.fields?.['f-prog'] || ''}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;direction:rtl;background:#edf0f7;color:#1e293b}
  .page{max-width:820px;margin:0 auto;padding:20px}
  .pb{page-break-before:always}
  @media print{body{background:white}.page{padding:8px}}
</style>
</head>
<body><div class="page">
<div style="background:#1a2744;color:white;border-radius:12px;padding:14px 20px;margin-bottom:20px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <div style="font-size:15px;font-weight:800">הערכת תוכניות חינוכיות</div>
    <div style="font-size:11px;opacity:0.65">${d.userName || ''} | ${d.userSchool || ''}</div>
  </div>
</div>
${banner('#e8eef8','#1a2744','שלב א׳ — טרום תוכנית','מיפוי צרכים, בחירת תוכנית, תכנון מערך ההערכה')}
${progressBar('התקדמות שלב א׳', scores[0])}
${card('פרטי התוכנית','',`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
  ${[['שם התוכנית',d.fields?.['f-prog']],['שנת לימודים',d.fields?.['f-year']],['וותק',d.fields?.['f-seniority']],['קהל יעד',d.fields?.['f-target']],['יעד',d.fields?.['f-domain']],['תחום',d.fields?.['f-area']],['תלמידים',d.fields?.['f-num']],['אנשי צוות',d.fields?.['f-contact']]].map(([l,v])=>`
  <div style="background:#f8fafc;border:1px solid #e0e6ed;border-radius:6px;padding:7px 10px">
    <div style="font-size:10px;color:#6b7280;margin-bottom:2px">${l}</div>
    <div style="font-weight:700;font-size:12px">${v||'—'}</div>
  </div>`).join('')}
</div>`)}
<div class="pb"></div>
${banner('#e8f5f2','#0d7c66','שלב ב׳ — במהלך התוכנית','מעקב שוטף ומדידת ביניים')}
${progressBar('התקדמות שלב ב׳', scores[1])}
<div class="pb"></div>
${banner('#fef3e2','#e67e22','שלב ג׳ — הערכת סוף תוכנית','הערכה מסכמת')}
${progressBar('התקדמות שלב ג׳', scores[2])}
<div class="pb"></div>
${banner('#eafaf1','#27ae60','סיכום ולקחים','תמונה כוללת של הערכת התוכנית')}
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
  ${[['שלב א׳',scores[0],'#1a2744'],['שלב ב׳',scores[1],'#0d7c66'],['שלב ג׳',scores[2],'#e67e22']].map(([l,s,c])=>`
  <div style="background:white;border-radius:12px;padding:18px;text-align:center;box-shadow:0 2px 10px rgba(26,39,68,0.08)">
    <div style="font-size:2rem;font-weight:900;color:${c};line-height:1">${s}%</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px">${l}</div>
  </div>`).join('')}
</div>
${card('החלטה','',d.decision?`<div style="font-size:13px;font-weight:700;color:#0d7c66">${decMap[d.decision]||d.decision}</div>${noteBox(d.notes?.n12,'הנמקה...')}`:`<div style="color:#bbb;font-size:12px">טרם נבחרה החלטה</div>`)}
<div style="text-align:center;font-size:10px;color:#aaa;margin-top:20px;padding-top:12px;border-top:1px solid #e0e6ed">
  כלי הערכת תוכניות חינוכיות | מחוז חיפה | ${new Date().toLocaleString('he-IL')}
</div>
</div></body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:850px;height:600px;border:none;';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 3000);
    }, 800);
  }

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <Topbar userName={userName} userCode={userCode} userSchool={userSchool}
              fields={fields} currentPhase={3} scores={scores}
              onSave={() => save(true)} saving={saving} onNavigate={onNavigate} />

      <div className="phase-layout">
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

        <BottomNav phaseIndex={3} score={null} scores={scores} onPrev={onPrev} onNext={null} showPrev={true} nextLabel="" />
      </div>
    </div>
  );
}
