import { useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { generateInsights } from '../constants/scoreCalc';

export function AdminScreen({ onBack, active }) {
  const [authed, setAuthed]         = useState(false);
  const [pw, setPw]                 = useState('');
  const [pwError, setPwError]       = useState(false);
  const [entries, setEntries]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  async function handleLogin() {
    try {
      await api.adminLogin(pw);
      setAuthed(true);
      loadEntries();
    } catch {
      setPwError(true);
      setPw('');
    }
  }

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await api.adminGetEntries(pw);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.deleteEvaluation(deleteConfirm.code, pw);
      setEntries(prev => prev.filter(e => e.userCode !== deleteConfirm.code));
      setDeleteConfirm(null);
    } catch (e) {
      alert('שגיאה במחיקה: ' + e.message);
    } finally {
      setDeleting(false);
    }
  }

  function exportXlsx() {
    if (!entries.length) return;
    const dh = { continue: 'להמשיך', modify: 'עם שינויים', replace: 'להחליף', stop: 'לא להמשיך' };
    const scaleText = v => !v ? '' : v === 1 ? '1 — לא מתקיים' : v === 2 ? '2 — חלקי' : v === 3 ? '3 — מספק' : '4 — מצוין';
    const chk = (e, id) => e.checks?.[id] ? 'כן' : 'לא';

    const H = [
      // פרטים כלליים
      'סמל מוסד', 'שם בית ספר', 'שם מנהל/ת', 'שם מפקח/ת', 'קוד',
      'שם תוכנית', 'שנת לימודים', 'וותק', 'קהל יעד', 'יעד', 'תחום',
      'מספר תלמידים', 'מספר אנשי צוות',
      // ציונים
      'שלב א׳ %', 'שלב ב׳ %', 'שלב ג׳ %',
      // שלב א׳ — תיבות סימון
      'א1 — מיפוי תמונת מצב', 'א2 — אותרו צרכים', 'א3 — נתונים פנימיים וחיצוניים',
      'א4 — שותפות הנהלה', 'א5 — סטטוס אוכלוסיית יעד',
      'א6 — הלימה למטרות', 'א7 — נבדקו חלופות', 'א8 — המלצות מבתי ספר', 'א9 — אין חפיפה',
      'א10 — שעות מעוגנות', 'א11 — תשתיות הותאמו', 'א12 — הוגדר אחראי',
      'א13 — הוגדר קהל יעד', 'א14 — משאב תקציבי אושר',
      'א15 — מדדי סדירות', 'א16 — מדדי תפוקה', 'א17 — כלי הערכה',
      'א18 — צמתי הערכה', 'א19 — יעד ספציפי',
      // הערות שלב א׳
      'הערה א׳1 — צורך מרכזי', 'הערה א׳2 — הלימה', 'הערה א׳3 — משאבים', 'הערה א׳4 — מדדים',
      // שלב ב׳ — סולמות
      'ב1 — סדירות מפגשים', 'ב2 — השתתפות קהל יעד',
      'ב3 — תכנון מפגשים', 'ב4 — התאמת מנחה', 'ב5 — יישום מטרות',
      'ב6 — שביעות רצון תלמידים', 'ב7 — שביעות רצון מורים',
      'ב8 — עדויות לשינוי', 'ב9 — תשתיות מספיקות',
      // הערות שלב ב׳
      'הערה ב׳1 — סדירות', 'הערה ב׳2 — איכות', 'הערה ב׳3 — עדויות',
      // שלב ג׳ — סולמות
      'ג1 — שיפור בתחום', 'ג2 — שביעות רצון קהל יעד', 'ג3 — כדאיות השקעה',
      // הערות שלב ג׳
      'הערה ג׳1 — נתוני השוואה', 'הערה ג׳2 — מה לא עבד',
      'הערה ג׳3 — מה עבד', 'הערה ג׳4 — המלצה לשנה הבאה',
      // סיכום
      'החלטה', 'הנמקה', 'הערות סיכום כלליות',
      // תובנות
      'תובנות אוטומטיות', 'דרכי פעולה מומלצות', 'דרכי שיפור נתונים',
      'תאריך עדכון'
    ];

    const rows = entries.map(e => {
      const scores = [e.phase1_pct || 0, e.phase2_pct || 0, e.phase3_pct || 0, 0];
      const { insights, actions, dataRecs } = generateInsights(e, scores);
      return [
        // פרטים כלליים
        e.userName || '', e.userSchool || '', e.userPrincipal || '', e.userSupervisor || '', e.userCode || '',
        e.fields?.['f-prog'] || '', e.fields?.['f-year'] || '', e.fields?.['f-seniority'] || '',
        e.fields?.['f-target'] || '', e.fields?.['f-domain'] || '', e.fields?.['f-area'] || '',
        e.fields?.['f-num'] || '', e.fields?.['f-contact'] || '',
        // ציונים
        (e.phase1_pct || 0) + '%', (e.phase2_pct || 0) + '%', (e.phase3_pct || 0) + '%',
        // שלב א׳ — תיבות סימון
        chk(e,'c1'), chk(e,'c2'), chk(e,'c3'), chk(e,'c4'), chk(e,'c5'),
        chk(e,'c19'), chk(e,'c6'), chk(e,'c7'), chk(e,'c8'),
        chk(e,'c9'), chk(e,'c10'), chk(e,'c11'), chk(e,'c12'), chk(e,'c13'),
        chk(e,'c14'), chk(e,'c15'), chk(e,'c16'), chk(e,'c17'), chk(e,'c18'),
        // הערות שלב א׳
        e.notes?.n1 || '', e.notes?.n2 || '', e.notes?.n3 || '', e.notes?.n4 || '',
        // שלב ב׳ — סולמות
        scaleText(e.scales?.reg1), scaleText(e.scales?.reg2),
        scaleText(e.scales?.qu1), scaleText(e.scales?.qu2), scaleText(e.scales?.qu3),
        scaleText(e.scales?.qu4), scaleText(e.scales?.qu5),
        scaleText(e.scales?.pr1), scaleText(e.scales?.pr2),
        // הערות שלב ב׳
        e.notes?.n5 || '', e.notes?.n6 || '', e.notes?.n7 || '',
        // שלב ג׳ — סולמות
        scaleText(e.scales?.out1), scaleText(e.scales?.out2), scaleText(e.scales?.out4),
        // הערות שלב ג׳
        e.notes?.n8 || '', e.notes?.n9 || '', e.notes?.n10 || '', e.notes?.n11 || '',
        // סיכום
        dh[e.decision] || '', e.notes?.n12 || '', e.notes?.n13 || '',
        // תובנות
        insights.join(' | '), actions.join(' | '), dataRecs.join(' | '),
        new Date(e.savedAt).toLocaleString('he-IL')
      ];
    });

    const wb = XLSX.utils.book_new();

    // גיליון 1 — נתונים מלאים
    const ws1 = XLSX.utils.aoa_to_sheet([H, ...rows]);
    ws1['!cols'] = H.map((h, i) => ({
      wch: i < 5 ? 12 : i < 13 ? 20 : i < 16 ? 10 : i < 35 ? 8 : 40
    }));
    XLSX.utils.book_append_sheet(wb, ws1, 'נתונים מלאים');

    // גיליון 2 — סיכום מנהלי
    const H2 = ['סמל מוסד', 'שם בית ספר', 'מפקח/ת', 'שם תוכנית', 'קהל יעד',
                 'שלב א׳ %', 'שלב ב׳ %', 'שלב ג׳ %', 'החלטה', 'תאריך'];
    const rows2 = entries.map(e => [
      e.userName || '', e.userSchool || '', e.userSupervisor || '',
      e.fields?.['f-prog'] || '', e.fields?.['f-target'] || '',
      (e.phase1_pct || 0) + '%', (e.phase2_pct || 0) + '%', (e.phase3_pct || 0) + '%',
      dh[e.decision] || '', new Date(e.savedAt).toLocaleDateString('he-IL')
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([H2, ...rows2]);
    ws2['!cols'] = [{wch:12},{wch:20},{wch:16},{wch:22},{wch:20},{wch:10},{wch:10},{wch:10},{wch:14},{wch:14}];
    XLSX.utils.book_append_sheet(wb, ws2, 'סיכום מנהלי');

    XLSX.writeFile(wb, `RAMA_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.xlsx`);
  }

  function printEntry(e) {
    const sc = e.scales || {};
    const ch = e.checks || {};
    const scores = [e.phase1_pct || 0, e.phase2_pct || 0, e.phase3_pct || 0, 0];
    const { insights, actions, dataRecs } = generateInsights(e, scores);

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
        <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;">
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
<title>דוח הערכת תוכנית — ${e.fields?.['f-prog'] || ''}</title>
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
    <div style="font-size:11px;opacity:0.65">${e.userName || ''} | ${e.userSchool || ''}</div>
  </div>
  <div style="background:rgba(255,255,255,0.08);padding:6px 0;font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:10px">
    ${[e.fields?.['f-prog'],e.userSchool,e.fields?.['f-year'],e.fields?.['f-domain'],e.fields?.['f-target']].filter(Boolean).join(' | ')}
  </div>
</div>
${banner('#e8eef8','#1a2744','שלב א׳ — טרום תוכנית','מיפוי צרכים, בחירת תוכנית, תכנון מערך ההערכה')}
${card('פרטי התוכנית','',`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
  ${[['שם התוכנית',e.fields?.['f-prog']],['שנת לימודים',e.fields?.['f-year']],['סמל מוסד',e.userName],['שם בית הספר',e.userSchool],['שם מנהל/ת',e.userPrincipal],['שם מפקח/ת',e.userSupervisor],['וותק',e.fields?.['f-seniority']],['קהל יעד',e.fields?.['f-target']],['יעד',e.fields?.['f-domain']],['תחום',e.fields?.['f-area']],['תלמידים',e.fields?.['f-num']],['אנשי צוות',e.fields?.['f-contact']]].map(([l,v])=>`
  <div style="background:#f8fafc;border:1px solid #e0e6ed;border-radius:6px;padding:7px 10px">
    <div style="font-size:10px;color:#6b7280;margin-bottom:2px">${l}</div>
    <div style="font-weight:700;font-size:12px">${v||'—'}</div>
  </div>`).join('')}
</div>`)}
${progressBar('התקדמות שלב א׳', scores[0])}
${card('מיפוי צרכים בית-ספרי','זיהוי הצורך המרכזי',
  ['c1','c2','c3','c4','c5'].map((c,i)=>ciRow(c,['הושלם תהליך מיפוי תמונת מצב בית ספרית','אותרו צרכים בית ספריים לקידום','הצורך התבסס על נתונים פנימיים וחיצוניים','צוות הניהול היה שותף לזיהוי הצורך ואישר את הבחירה','הושלם סטטוס של אוכלוסיית היעד לקראת הפעלת התוכנית'][i])).join('')+
  `<div style="font-size:10px;color:#6b7280;margin-top:8px">הצורך המרכזי שזוהה:</div>${noteBox(e.notes?.n1,'')}`
)}
${card('בחירת התוכנית והלימה לצורך','',
  ['c19','c6','c7','c8'].map((c,i)=>ciRow(c,['הלימה בין מטרות התוכנית לצורך הבית-ספרי','נבדקו תוכניות חלופיות לפני הבחירה הסופית','קיבלנו המלצות מבתי ספר אחרים שהפעילו את התוכנית','אין חפיפה עם תוכנית קיימת אחרת בבית הספר'][i])).join('')+
  `<div style="font-size:10px;color:#6b7280;margin-top:8px">הסבר על ההלימה:</div>${noteBox(e.notes?.n2,'')}`
)}
${card('משאבים ותשתית','',
  ['c9','c10','c11','c12','c13'].map((c,i)=>ciRow(c,['שעות להפעלת התוכנית מעוגנות במערכת הבית ספרית','הותאמו תשתיות הנדרשות ליישום התוכנית','הוגדר אחראי מטעם בית הספר והוגדרו תחומי אחריותו','הוגדר קהל היעד — מספר תלמידים / מורים ומאפיינים','הוגדר משאב תקציבי ואושר על ידי מפקחת בית הספר'][i])).join('')+
  `<div style="font-size:10px;color:#6b7280;margin-top:8px">פרטי משאבים:</div>${noteBox(e.notes?.n3,'')}`
)}
${card('מדדי הערכה וצמתי מעקב','',
  ['c14','c15','c16','c17','c18'].map((c,i)=>ciRow(c,['נקבעו מדדי סדירות: מספר מפגשים, אחוז נוכחות','נקבעו מדדי תפוקה: שיפור הישגים / רגשי / חברתי','נבחרו כלי הערכה ספציפיים (שאלון, מבחן, ראיון, תצפית)','נקבעו צמתי הערכה בלוח השנה','נקבע יעד ספציפי ומדיד להגדרת ההצלחה'][i])).join('')+
  `<div style="font-size:10px;color:#6b7280;margin-top:8px">פירוט מדדים ויעדים:</div>${noteBox(e.notes?.n4,'')}`
)}
<div class="pb"></div>
${banner('#e8f5f2','#0d7c66','שלב ב׳ — במהלך התוכנית','מעקב שוטף ומדידת ביניים')}
${progressBar('התקדמות שלב ב׳', scores[1])}
${card('סדירות וכמות','',legend()+scaleRow('reg1','המפגשים התקיימו באופן סדיר','מעל 80%=מצוין | 60–80%=מספק | מתחת 60%=בעייתי')+scaleRow('reg2','כל קהל היעד השתתף בכל המפגשים','')+`<div style="font-size:10px;color:#6b7280;margin-top:8px">הערות:</div>${noteBox(e.notes?.n5,'')}`)}
${card('איכות הביצוע','',legend()+scaleRow('qu1','תכנון המפגשים','')+scaleRow('qu2','התאמת המנחה לרציונל התוכנית','')+scaleRow('qu3','מטרות התוכנית מיושמות','')+scaleRow('qu4','מידת שביעות רצון התלמידים גבוהה','')+scaleRow('qu5','המורים המעורבים בתוכנית מביעים שביעות רצון גבוהה','')+`<div style="font-size:10px;color:#6b7280;margin-top:8px">הערות:</div>${noteBox(e.notes?.n6,'')}`)}
${card('סימני התקדמות','',legend()+scaleRow('pr1','קיימות עדויות לשינוי המצביעות על שיפור בתחום הנבחר','')+scaleRow('pr2','תשתיות ומשאבים מספיקים להמשך הפעלת התוכנית','')+`<div style="font-size:10px;color:#6b7280;margin-top:8px">עדויות לשינוי:</div>${noteBox(e.notes?.n7,'')}`)}
<div class="pb"></div>
${banner('#fef3e2','#e67e22','שלב ג׳ — הערכת סוף תוכנית','הערכה מסכמת')}
${progressBar('התקדמות שלב ג׳', scores[2])}
${card('השגת יעדים ותוצאות','',legend(['לא הושג','הושג חלקית','הושג ברובו','הושג במלואו'])+scaleRow('out1','הושג שיפור בתחום הנבחר','')+scaleRow('out2','שביעות הרצון של קהל היעד גבוהה','')+scaleRow('out4','התוצאות מצביעות על כדאיות ההשקעה','')+`<div style="font-size:10px;color:#6b7280;margin-top:8px">נתוני השוואה:</div>${noteBox(e.notes?.n8,'')}`)}
${card('לקחים והמלצות','',`<div style="font-size:10px;color:#6b7280;margin-bottom:3px">מה לא עבד:</div>${noteBox(e.notes?.n9,'')}<div style="font-size:10px;color:#6b7280;margin-top:10px;margin-bottom:3px">מה עבד טוב:</div>${noteBox(e.notes?.n10,'')}<div style="font-size:10px;color:#6b7280;margin-top:10px;margin-bottom:3px">המלצה לשנה הבאה:</div>${noteBox(e.notes?.n11,'')}`)}
<div class="pb"></div>
${banner('#eafaf1','#27ae60','סיכום ולקחים','תמונה כוללת')}
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
  ${[['שלב א׳',scores[0],'#1a2744'],['שלב ב׳',scores[1],'#0d7c66'],['שלב ג׳',scores[2],'#e67e22']].map(([l,s,c])=>`
  <div style="background:white;border-radius:12px;padding:18px;text-align:center;box-shadow:0 2px 10px rgba(26,39,68,0.08)">
    <div style="font-size:2rem;font-weight:900;color:${c};line-height:1">${s}%</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px">${l}</div>
  </div>`).join('')}
</div>
<div style="background:#e8f5f2;border-radius:12px;padding:16px;border-right:4px solid #0d7c66;margin-bottom:14px">
  <div style="font-size:13px;font-weight:700;color:#0d7c66;margin-bottom:8px">תובנות אוטומטיות</div>
  <ul style="padding-right:18px;margin-bottom:10px">${insights.map(t=>`<li style="font-size:12px;margin-bottom:5px;line-height:1.6">${t}</li>`).join('')}</ul>
  <div style="font-size:13px;font-weight:700;color:#b7800a;margin-top:10px;margin-bottom:8px">דרכי פעולה מומלצות</div>
  <ul style="padding-right:18px;margin-bottom:10px">${actions.length?actions.map(t=>`<li style="font-size:12px;margin-bottom:5px;line-height:1.6">${t}</li>`).join(''):'<li style="list-style:none;font-size:12px;color:#aaa;font-style:italic">אין פריטים להצגה</li>'}</ul>
  <div style="font-size:13px;font-weight:700;color:#1a2744;margin-top:10px;margin-bottom:8px">דרכי שיפור הנתונים</div>
  <ul style="padding-right:18px">${dataRecs.length?dataRecs.map(t=>`<li style="font-size:12px;margin-bottom:5px;line-height:1.6">${t}</li>`).join(''):'<li style="list-style:none;font-size:12px;color:#aaa;font-style:italic">אין פריטים להצגה</li>'}</ul>
</div>
${card('החלטה על המשך התוכנית','',
  (e.decision?`<div style="display:inline-block;background:#e8f5f2;border:2px solid #0d7c66;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:700;color:#0d7c66;margin-bottom:10px">${decMap[e.decision]||e.decision}</div>`:`<div style="font-size:12px;color:#bbb;margin-bottom:10px">טרם נבחרה החלטה</div>`)+
  `<div style="font-size:10px;color:#6b7280;margin-bottom:3px">הנמקה:</div>${noteBox(e.notes?.n12,'')}`
)}
${card('הערות סיכום כלליות','',noteBox(e.notes?.n13,''))}
<div style="text-align:center;font-size:10px;color:#aaa;margin-top:20px;padding-top:12px;border-top:1px solid #e0e6ed">
  כלי הערכת תוכניות חינוכיות | מחוז חיפה | ${new Date().toLocaleString('he-IL')}
</div>
</div></body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 800);
  }

  const bc = v => !v ? 'ab-y' : v >= 80 ? 'ab-g' : v >= 50 ? 'ab-y' : 'ab-r';
  const dh = { continue: 'המשך', modify: 'עם שינויים', replace: 'להחליף', stop: 'לא להמשיך' };

  return (
    <div className={`screen admin-screen${active ? ' active' : ''}`} style={{ display: 'flex' }}>

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 36, maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c0392b', marginBottom: 10 }}>מחיקת הערכה</h2>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: 6 }}>האם אתה בטוח שברצונך למחוק את:</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2744', marginBottom: 20 }}>{deleteConfirm.name || deleteConfirm.code}</p>
            <p style={{ fontSize: '0.78rem', color: '#e74c3c', marginBottom: 24 }}>⚠️ פעולה זו היא סופית ולא ניתנת לביטול!</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: '10px 24px', background: '#c0392b', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'Heebo', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                {deleting ? 'מוחק...' : 'כן, מחק'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                style={{ padding: '10px 24px', background: '#f3f4f6', color: '#1a2744', border: 'none', borderRadius: 10, fontFamily: 'Heebo', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {!authed && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 38, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem' }}>🔐</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', margin: '10px 0 5px' }}>כניסת מנהל מערכת</h2>
            <p style={{ fontSize: '0.81rem', color: 'var(--gray)', marginBottom: 22 }}>הכנס/י את סיסמת המנהל</p>
            <input type="password" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleLogin()}
                   placeholder="סיסמה"
                   style={{ width: '100%', border: '2px solid var(--border)', borderRadius: 10, padding: '11px 13px', fontFamily: 'Heebo', fontSize: '1rem', textAlign: 'center', letterSpacing: 3, background: 'var(--gray-light)', marginBottom: 13 }} />
            {pwError && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginBottom: 10 }}>❌ סיסמה שגויה</p>}
            <button className="btn-main" onClick={handleLogin}>כניסה</button>
            <br /><br />
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Heebo' }}>← חזור</button>
          </div>
        </div>
      )}

      <div className="admin-header">
        <h1>🛡️ מנהל מערכת — כל הנתונים</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportXlsx} style={{ padding: '9px 20px', borderRadius: 9, fontFamily: 'Heebo', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'var(--green)', color: 'white' }}>📥 ייצוא לאקסל</button>
          <button onClick={onBack} style={{ padding: '9px 20px', borderRadius: 9, fontFamily: 'Heebo', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}>← יציאה</button>
        </div>
      </div>

      <div className="admin-body">
        <div className="admin-stat-grid">
          {[
            { v: entries.length, l: 'סה"כ הגשות' },
            { v: entries.filter(e => e.phase1_pct >= 60).length, l: 'הגשות מלאות' },
            { v: entries.length ? Math.round(entries.reduce((a, e) => a + (e.phase2_pct || 0), 0) / entries.length) + '%' : '—', l: 'ממוצע מהלך' },
            { v: entries.length ? Math.round(entries.reduce((a, e) => a + (e.phase3_pct || 0), 0) / entries.length) + '%' : '—', l: 'ממוצע תוצאות' },
          ].map(({ v, l }) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', color: 'white' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: '0.73rem', opacity: 0.55, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <table className="atable">
            <thead>
              <tr>
                <th>פעולות</th><th>שם</th><th>בית ספר</th><th>מפקח/ת</th><th>תוכנית</th><th>תחום</th>
                <th>הכנה</th><th>מהלך</th><th>תוצאות</th><th>החלטה</th><th>עדכון</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={11} style={{ textAlign: 'center', padding: 44, color: 'rgba(255,255,255,0.35)' }}>טוען...</td></tr>}
              {!loading && !entries.length && <tr><td colSpan={11} style={{ textAlign: 'center', padding: 44, color: 'rgba(255,255,255,0.35)' }}>אין נתונים עדיין</td></tr>}
              {entries.map((e, i) => {
                const dt = new Date(e.savedAt);
                const ds = dt.toLocaleDateString('he-IL') + ' ' + dt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => printEntry(e)} title="הדפס דוח מלא"
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: '1rem' }}>
                          🖨️
                        </button>
                        <button onClick={() => setDeleteConfirm({ code: e.userCode, name: `${e.fields?.['f-prog'] || ''} — ${e.userSchool || ''}` })}
                          title="מחק הערכה"
                          style={{ background: 'rgba(192,57,43,0.3)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: '1rem' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                    <td><strong>{e.userName || '—'}</strong></td>
                    <td>{e.userSchool || '—'}</td>
                    <td>{e.userSupervisor || '—'}</td>
                    <td>{e.fields?.['f-prog'] || '—'}</td>
                    <td>{e.fields?.['f-domain'] || '—'}</td>
                    <td><span className={`abadge ${bc(e.phase1_pct)}`}>{e.phase1_pct || 0}%</span></td>
                    <td><span className={`abadge ${bc(e.phase2_pct)}`}>{e.phase2_pct || 0}%</span></td>
                    <td><span className={`abadge ${bc(e.phase3_pct)}`}>{e.phase3_pct || 0}%</span></td>
                    <td style={{ fontSize: '.78rem' }}>{dh[e.decision] || '—'}</td>
                    <td style={{ fontSize: '.74rem', opacity: 0.6 }}>{ds}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

