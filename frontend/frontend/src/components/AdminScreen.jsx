import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { generateInsights } from '../constants/scoreCalc';

export function AdminScreen({ onBack, active }) {
  const [authed, setAuthed]     = useState(false);
  const [pw, setPw]             = useState('');
  const [pwError, setPwError]   = useState(false);
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(false);

  const [filterDecision,   setFilterDecision]   = useState('all');
  const [filterColor,      setFilterColor]      = useState('all');
  const [filterSupervisor, setFilterSupervisor] = useState('all');

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

  function colorOf(pct) {
    if (pct == null) return 'none';
    if (pct >= 80) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  }

  function rowColor(e) {
    const vals = [e.phase1_pct, e.phase2_pct, e.phase3_pct].filter(v => v != null);
    if (!vals.length) return 'none';
    return colorOf(Math.min(...vals));
  }

  const supervisors = useMemo(() => {
    const s = new Set(entries.map(e => e.userSupervisor).filter(Boolean));
    return [...s].sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filterDecision   !== 'all' && e.decision       !== filterDecision)   return false;
      if (filterColor      !== 'all' && rowColor(e)      !== filterColor)      return false;
      if (filterSupervisor !== 'all' && e.userSupervisor !== filterSupervisor) return false;
      return true;
    });
  }, [entries, filterDecision, filterColor, filterSupervisor]);

  function resetFilters() {
    setFilterDecision('all');
    setFilterColor('all');
    setFilterSupervisor('all');
  }

  const isFiltered = filterDecision !== 'all' || filterColor !== 'all' || filterSupervisor !== 'all';

  const dh = { continue: 'המשך', modify: 'עם שינויים', replace: 'להחליף', stop: 'לא להמשיך' };
  const formatDate = s => s ? new Date(s).toLocaleDateString('he-IL') : '—';

  function BadgeCell({ pct }) {
    if (pct == null) return <span style={{ color: '#bbb' }}>—</span>;
    const bg = pct >= 80 ? '#d4edda' : pct >= 50 ? '#fff3cd' : '#f8d7da';
    const cl = pct >= 80 ? '#155724' : pct >= 50 ? '#856404' : '#721c24';
    return (
      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8,
                     background: bg, color: cl, fontWeight: 700, fontSize: '0.75rem' }}>
        {pct}%
      </span>
    );
  }

  function exportXlsx() {
    if (!filtered.length) return;
    const H = [
      'סמל מוסד','שם בית ספר','שם מנהל/ת','שם מפקח/ת','קוד',
      'שם תוכנית','שנת לימודים','קהל יעד','תחום','יעד',
      'שלב א׳ %','שלב ב׳ %','שלב ג׳ %',
      'החלטה','הנמקה','הערות סיכום',
      'תובנות אוטומטיות','דרכי פעולה מומלצות','דרכי שיפור נתונים','תאריך עדכון'
    ];
    const rows = filtered.map(e => {
      const scores = [e.phase1_pct||0, e.phase2_pct||0, e.phase3_pct||0, 0];
      const { insights, actions, dataRecs } = generateInsights(e, scores);
      return [
        e.userName||'', e.userSchool||'', e.userPrincipal||'', e.userSupervisor||'', e.userCode||'',
        e.fields?.['f-prog']||'', e.fields?.['f-year']||'',
        e.fields?.['f-target']||'', e.fields?.['f-domain']||'', e.fields?.['f-goal']||'',
        e.phase1_pct||0, e.phase2_pct||0, e.phase3_pct||0,
        dh[e.decision]||'', e.decision_reason||'', e.summary_notes||'',
        insights?.join(' | ')||'', actions?.join(' | ')||'', dataRecs?.join(' | ')||'',
        formatDate(e.savedAt)
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([H, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'הערכות');
    XLSX.writeFile(wb, 'kalanit_export.xlsx');
  }

  function handlePrint(e) {
    const w = window.open('', '_blank');
    const dLabel = dh[e.decision] || '—';
    const bCl = v => v >= 80 ? '#d4edda' : v >= 50 ? '#fff3cd' : '#f8d7da';
    const bTx = v => v >= 80 ? '#155724' : v >= 50 ? '#856404' : '#721c24';
    w.document.write(`<!DOCTYPE html><html dir="rtl"><head>
      <meta charset="utf-8"/>
      <title>דוח הערכה — ${e.userSchool||''}</title>
      <style>
        body{font-family:'Heebo',Arial,sans-serif;direction:rtl;padding:30px;color:#1a2233;font-size:14px}
        h1{font-size:20px;color:#1a3a5c;margin-bottom:4px}
        .sub{color:#666;font-size:13px;margin-bottom:20px}
        .section{margin-bottom:18px}
        .section h2{font-size:15px;color:#1a3a5c;border-bottom:2px solid #e8f0fe;padding-bottom:4px;margin-bottom:10px}
        .row{display:flex;gap:30px;margin-bottom:6px}
        .lbl{color:#888;font-size:12px;min-width:120px}
        .val{font-weight:600}
        .badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700}
        @media print{body{padding:15px}}
      </style>
    </head><body>
      <h1>🌸 דוח הערכת תוכנית — כלנית</h1>
      <div class="sub">תאריך: ${formatDate(e.savedAt)}</div>
      <div class="section"><h2>פרטי המוסד</h2>
        <div class="row"><span class="lbl">סמל מוסד</span><span class="val">${e.userName||'—'}</span></div>
        <div class="row"><span class="lbl">שם בית הספר</span><span class="val">${e.userSchool||'—'}</span></div>
        <div class="row"><span class="lbl">שם מנהל/ת</span><span class="val">${e.userPrincipal||'—'}</span></div>
        <div class="row"><span class="lbl">שם מפקח/ת</span><span class="val">${e.userSupervisor||'—'}</span></div>
      </div>
      <div class="section"><h2>פרטי התוכנית</h2>
        <div class="row"><span class="lbl">שם תוכנית</span><span class="val">${e.fields?.['f-prog']||'—'}</span></div>
        <div class="row"><span class="lbl">שנת לימודים</span><span class="val">${e.fields?.['f-year']||'—'}</span></div>
        <div class="row"><span class="lbl">קהל יעד</span><span class="val">${e.fields?.['f-target']||'—'}</span></div>
        <div class="row"><span class="lbl">תחום</span><span class="val">${e.fields?.['f-domain']||'—'}</span></div>
      </div>
      <div class="section"><h2>ציונים לפי שלבים</h2>
        <div class="row"><span class="lbl">שלב א׳</span>
          <span class="badge" style="background:${bCl(e.phase1_pct)};color:${bTx(e.phase1_pct)}">${e.phase1_pct||0}%</span></div>
        <div class="row"><span class="lbl">שלב ב׳</span>
          <span class="badge" style="background:${bCl(e.phase2_pct)};color:${bTx(e.phase2_pct)}">${e.phase2_pct||0}%</span></div>
        <div class="row"><span class="lbl">שלב ג׳</span>
          <span class="badge" style="background:${bCl(e.phase3_pct)};color:${bTx(e.phase3_pct)}">${e.phase3_pct||0}%</span></div>
      </div>
      <div class="section"><h2>החלטה והנמקה</h2>
        <div class="row"><span class="lbl">המלצה</span><span class="val">${dLabel}</span></div>
        <div class="row"><span class="lbl">הנמקה</span><span class="val">${e.decision_reason||'—'}</span></div>
        <div class="row"><span class="lbl">הערות</span><span class="val">${e.summary_notes||'—'}</span></div>
      </div>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : null;
  const avgMid  = avg(filtered.map(e=>e.phase2_pct).filter(v=>v!=null));
  const avgAll  = avg(filtered.flatMap(e=>[e.phase1_pct,e.phase2_pct,e.phase3_pct].filter(v=>v!=null)));
  const fullCount = filtered.filter(e=>e.phase1_pct>=60).length;

  return (
    // ✅ חזרה ל-className המקורי — App.jsx מנהל את הנראות דרך CSS
    <div className={`screen admin-screen${active ? ' active' : ''}`}
         style={{ flexDirection: 'column', background: '#f0f4f8', fontFamily: 'Heebo, Arial, sans-serif' }}>

      {/* ── כניסה ── */}
      {!authed && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
                      backdropFilter:'blur(8px)', zIndex:200, display:'flex',
                      alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:20, padding:38,
                        maxWidth:360, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:'2.2rem' }}>🔐</div>
            <h2 style={{ fontSize:'1.25rem', fontWeight:800, color:'#1a3a5c', margin:'10px 0 5px' }}>
              כניסת מנהל מערכת
            </h2>
            <p style={{ fontSize:'0.81rem', color:'#888', marginBottom:22 }}>הכנס/י את סיסמת המנהל</p>
            <input type="password" autoComplete="new-password" value={pw}
                   onChange={e => setPw(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleLogin()}
                   placeholder="סיסמה"
                   style={{ width:'100%', border:'2px solid #dde3ee', borderRadius:10,
                            padding:'11px 13px', fontFamily:'Heebo', fontSize:'1rem',
                            textAlign:'center', letterSpacing:3, background:'#f4f7fb', marginBottom:13 }} />
            {pwError && <p style={{ color:'#c0392b', fontSize:'0.8rem', marginBottom:10 }}>❌ סיסמה שגויה</p>}
            <button onClick={handleLogin}
              style={{ width:'100%', padding:12, borderRadius:10, border:'none',
                       background:'#1a3a5c', color:'white', fontFamily:'Heebo',
                       fontSize:'1rem', fontWeight:700, cursor:'pointer' }}>
              כניסה
            </button>
            <br/><br/>
            <button onClick={onBack}
              style={{ background:'none', border:'none', color:'#888',
                       cursor:'pointer', fontSize:'0.8rem', fontFamily:'Heebo' }}>
              ← חזור
            </button>
          </div>
        </div>
      )}

      {/* ── כותרת קבועה ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 24px', background:'#1a3a5c', flexShrink:0,
                    boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
        <h1 style={{ color:'white', fontSize:'1rem', fontWeight:800, margin:0 }}>
          🛡️ מנהל מערכת — כל הנתונים
        </h1>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={exportXlsx}
            style={{ padding:'9px 18px', borderRadius:9, fontFamily:'Heebo', fontSize:'0.83rem',
                     fontWeight:700, cursor:'pointer', border:'none',
                     background:'#27ae60', color:'white', whiteSpace:'nowrap' }}>
            📥 ייצוא לאקסל{isFiltered ? ` (${filtered.length})` : ''}
          </button>
          <button onClick={onBack}
            style={{ padding:'9px 18px', borderRadius:9, fontFamily:'Heebo', fontSize:'0.83rem',
                     fontWeight:700, cursor:'pointer', border:'none',
                     background:'rgba(255,255,255,0.15)', color:'white', whiteSpace:'nowrap' }}>
            ← יציאה
          </button>
        </div>
      </div>

      {/* ── גוף גלילה ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px 40px',
                    WebkitOverflowScrolling:'touch' }}>

        {/* כרטיסי סטטיסטיקה */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                      gap:12, marginBottom:18 }}>
          {[
            { v: filtered.length,                        l: isFiltered ? 'תוצאות פילטר' : 'סה"כ הגשות' },
            { v: fullCount,                              l: 'הגשות מלאות' },
            { v: avgMid != null ? avgMid + '%' : '—',   l: 'ממוצע מהלך' },
            { v: avgAll != null ? avgAll + '%' : '—',   l: 'ממוצע כללי' },
          ].map(({ v, l }) => (
            <div key={l} style={{ background:'white', borderRadius:12, padding:'14px 18px',
                                  boxShadow:'0 1px 4px rgba(0,0,0,0.08)', textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#1a3a5c' }}>{v ?? '—'}</div>
              <div style={{ fontSize:'0.75rem', color:'#888', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* שורת פילטרים */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap',
                      background:'white', borderRadius:12, padding:'14px 18px',
                      marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.07)',
                      border:'1.5px solid #dde3ee' }}>
          <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#1a3a5c', alignSelf:'center' }}>
            🔽 סינון:
          </span>

          {[
            { label:'לפי המלצה', val:filterDecision, set:setFilterDecision,
              opts:[['all','הכל'],['continue','המשך ✅'],['modify','עם שינויים 🔄'],
                    ['replace','להחליף ⚠️'],['stop','לא להמשיך ❌']] },
            { label:'לפי ציון כולל', val:filterColor, set:setFilterColor,
              opts:[['all','הכל'],['green','🟢 ירוק (80%+)'],['yellow','🟡 צהוב (50–79%)'],
                    ['red','🔴 אדום (עד 49%)'],['none','⚪ אין ציון']] },
            { label:'לפי מפקח/ת', val:filterSupervisor, set:setFilterSupervisor,
              opts:[['all','כל המפקחים'], ...supervisors.map(s=>[s,s])] },
          ].map(({ label, val, set, opts }) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <label style={{ fontSize:'0.71rem', color:'#888' }}>{label}</label>
              <select value={val} onChange={e => set(e.target.value)}
                style={{ padding:'7px 12px', borderRadius:8, fontFamily:'Heebo',
                         fontSize:'0.82rem', cursor:'pointer', outline:'none',
                         direction:'rtl', minWidth:150,
                         border: val !== 'all' ? '1.5px solid #4a90d9' : '1.5px solid #dde3ee',
                         background: val !== 'all' ? '#e8f3fd' : 'white',
                         color: val !== 'all' ? '#1a3a5c' : '#1a2233',
                         fontWeight: val !== 'all' ? 700 : 400 }}>
                {opts.map(([v,t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </div>
          ))}

          {isFiltered && (
            <button onClick={resetFilters}
              style={{ alignSelf:'flex-end', padding:'7px 14px', borderRadius:8, border:'none',
                       background:'#fde8e8', color:'#9c1a1a', fontFamily:'Heebo',
                       fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>
              ✕ נקה ({entries.length - filtered.length} מוסתרים)
            </button>
          )}
        </div>

        {/* טבלה */}
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#888' }}>טוען נתונים...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:'#888',
                        background:'white', borderRadius:12 }}>
            <div style={{ fontSize:'2rem', marginBottom:8 }}>🔍</div>
            {isFiltered ? 'לא נמצאו תוצאות — נסי לאפס את הפילטרים' : 'אין הגשות עדיין'}
          </div>
        ) : (
          <div style={{ background:'white', borderRadius:12,
                        boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
              <thead>
                <tr>
                  {['סמל מוסד','שם בית ספר','מפקח/ת','שם מנהל/ת','תוכנית',
                    'תחום','שלב א׳','שלב ב׳','שלב ג׳','המלצה','עדכון','דוח'].map(h => (
                    <th key={h} style={{ background:'#e8f0fa', color:'#1a3a5c',
                                        padding:'10px 13px', textAlign:'right',
                                        fontWeight:700, fontSize:'0.75rem',
                                        borderBottom:'2px solid #d0ddf0',
                                        whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const tdStyle = {
                    padding:'9px 13px', color:'#1a2233',
                    borderBottom:'1px solid #f0f4f8', verticalAlign:'middle',
                    background: i % 2 === 0 ? 'white' : '#fafbfd'
                  };
                  return (
                    <tr key={i}>
                      <td style={tdStyle}><strong>{e.userName||'—'}</strong></td>
                      <td style={tdStyle}>{e.userSchool||'—'}</td>
                      <td style={tdStyle}>{e.userSupervisor||'—'}</td>
                      <td style={tdStyle}>{e.userPrincipal||'—'}</td>
                      <td style={tdStyle}>{e.fields?.['f-prog']||'—'}</td>
                      <td style={tdStyle}>{e.fields?.['f-domain']||'—'}</td>
                      <td style={tdStyle}><BadgeCell pct={e.phase1_pct} /></td>
                      <td style={tdStyle}><BadgeCell pct={e.phase2_pct} /></td>
                      <td style={tdStyle}><BadgeCell pct={e.phase3_pct} /></td>
                      <td style={tdStyle}>{dh[e.decision]||'—'}</td>
                      <td style={{ ...tdStyle, fontSize:'0.73rem', color:'#999' }}>
                        {formatDate(e.savedAt)}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => handlePrint(e)}
                          style={{ padding:'5px 10px', borderRadius:7, border:'none',
                                   background:'#e8f3fd', color:'#1a5a9c', fontFamily:'Heebo',
                                   fontSize:'0.74rem', fontWeight:700, cursor:'pointer' }}>
                          🖨️ דוח
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
