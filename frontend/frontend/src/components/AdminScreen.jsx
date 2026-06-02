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

  // ── פילטרים ──
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

  // ── ציון → צבע ──
  function colorOf(pct) {
    if (pct == null) return 'none';
    if (pct >= 80) return 'green';
    if (pct >= 50) return 'yellow';
    return 'red';
  }

  // ── צבע כולל לשורה (הציון הנמוך ביותר מבין 3 השלבים) ──
  function rowColor(e) {
    const vals = [e.phase1_pct, e.phase2_pct, e.phase3_pct].filter(v => v != null);
    if (!vals.length) return 'none';
    const min = Math.min(...vals);
    return colorOf(min);
  }

  // ── רשימת מפקחים ייחודיים מהנתונים ──
  const supervisors = useMemo(() => {
    const s = new Set(entries.map(e => e.userSupervisor).filter(Boolean));
    return [...s].sort();
  }, [entries]);

  // ── סינון ──
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filterDecision !== 'all' && e.decision !== filterDecision) return false;
      if (filterColor !== 'all' && rowColor(e) !== filterColor) return false;
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

  // ── עזרי תצוגה ──
  const bc  = v => v >= 80 ? 'ab-g' : v >= 50 ? 'ab-y' : 'ab-r';
  const dh  = { continue: 'המשך', modify: 'עם שינויים', replace: 'להחליף', stop: 'לא להמשיך' };
  const formatDate = s => s ? new Date(s).toLocaleDateString('he-IL') : '—';

  // ── ייצוא אקסל ──
  function exportXlsx() {
    if (!filtered.length) return;
    const H = [
      'סמל מוסד','שם בית ספר','שם מנהל/ת','שם מפקח/ת','קוד',
      'שם תוכנית','שנת לימודים','קהל יעד','תחום','יעד',
      'שלב א׳ %','שלב ב׳ %','שלב ג׳ %',
      'החלטה','הנמקה','הערות סיכום',
      'תובנות אוטומטיות','דרכי פעולה מומלצות','דרכי שיפור נתונים',
      'תאריך עדכון'
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

  // ── הדפסת דוח ──
  function handlePrint(e) {
    const w = window.open('', '_blank');
    const dLabel = dh[e.decision] || '—';
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
        .bg{background:#d4edda;color:#155724}
        .by{background:#fff3cd;color:#856404}
        .br{background:#f8d7da;color:#721c24}
        @media print{body{padding:15px}}
      </style>
    </head><body>
      <h1>🌸 דוח הערכת תוכנית — כלנית</h1>
      <div class="sub">תאריך: ${formatDate(e.savedAt)}</div>
      <div class="section">
        <h2>פרטי המוסד</h2>
        <div class="row"><span class="lbl">סמל מוסד</span><span class="val">${e.userName||'—'}</span></div>
        <div class="row"><span class="lbl">שם בית הספר</span><span class="val">${e.userSchool||'—'}</span></div>
        <div class="row"><span class="lbl">שם מנהל/ת</span><span class="val">${e.userPrincipal||'—'}</span></div>
        <div class="row"><span class="lbl">שם מפקח/ת</span><span class="val">${e.userSupervisor||'—'}</span></div>
      </div>
      <div class="section">
        <h2>פרטי התוכנית</h2>
        <div class="row"><span class="lbl">שם תוכנית</span><span class="val">${e.fields?.['f-prog']||'—'}</span></div>
        <div class="row"><span class="lbl">שנת לימודים</span><span class="val">${e.fields?.['f-year']||'—'}</span></div>
        <div class="row"><span class="lbl">קהל יעד</span><span class="val">${e.fields?.['f-target']||'—'}</span></div>
        <div class="row"><span class="lbl">תחום</span><span class="val">${e.fields?.['f-domain']||'—'}</span></div>
      </div>
      <div class="section">
        <h2>ציונים לפי שלבים</h2>
        <div class="row"><span class="lbl">שלב א׳ — טרום</span>
          <span class="badge ${bc(e.phase1_pct)==='ab-g'?'bg':bc(e.phase1_pct)==='ab-y'?'by':'br'}">${e.phase1_pct||0}%</span></div>
        <div class="row"><span class="lbl">שלב ב׳ — מהלך</span>
          <span class="badge ${bc(e.phase2_pct)==='ab-g'?'bg':bc(e.phase2_pct)==='ab-y'?'by':'br'}">${e.phase2_pct||0}%</span></div>
        <div class="row"><span class="lbl">שלב ג׳ — סוף</span>
          <span class="badge ${bc(e.phase3_pct)==='ab-g'?'bg':bc(e.phase3_pct)==='ab-y'?'by':'br'}">${e.phase3_pct||0}%</span></div>
      </div>
      <div class="section">
        <h2>החלטה והנמקה</h2>
        <div class="row"><span class="lbl">המלצה</span><span class="val">${dLabel}</span></div>
        <div class="row"><span class="lbl">הנמקה</span><span class="val">${e.decision_reason||'—'}</span></div>
        <div class="row"><span class="lbl">הערות סיכום</span><span class="val">${e.summary_notes||'—'}</span></div>
      </div>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  // ── סטטיסטיקות (על הנתונים המסוננים) ──
  const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : null;
  const avgMid  = avg(filtered.map(e=>e.phase2_pct).filter(v=>v!=null));
  const avgAll  = avg(filtered.flatMap(e=>[e.phase1_pct,e.phase2_pct,e.phase3_pct].filter(v=>v!=null)));
  const fullCount = filtered.filter(e=>e.phase1_pct>=60).length;

  // ── DROP-DOWN STYLE ──
  const dropStyle = {
    padding: '8px 14px', borderRadius: 9, border: '1.5px solid var(--border,#dde3ee)',
    fontFamily: 'Heebo', fontSize: '0.83rem', background: 'white', color: '#1a2233',
    cursor: 'pointer', outline: 'none', direction: 'rtl'
  };
  const activeDropStyle = { ...dropStyle, borderColor: '#4a90d9', background: '#e8f3fd', fontWeight: 700 };

  return (
    <div className={`screen admin-screen${active ? ' active' : ''}`} style={{ display: 'flex' }}>

      {/* ── כניסה ── */}
      {!authed && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'white',borderRadius:20,padding:38,maxWidth:360,width:'90%',textAlign:'center' }}>
            <div style={{ fontSize:'2.2rem' }}>🔐</div>
            <h2 style={{ fontSize:'1.25rem',fontWeight:800,color:'var(--navy)',margin:'10px 0 5px' }}>כניסת מנהל מערכת</h2>
            <p style={{ fontSize:'0.81rem',color:'var(--gray)',marginBottom:22 }}>הכנס/י את סיסמת המנהל</p>
            <input type="password" autoComplete="new-password" value={pw} onChange={e=>setPw(e.target.value)}
                   onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="סיסמה"
                   style={{ width:'100%',border:'2px solid var(--border)',borderRadius:10,padding:'11px 13px',fontFamily:'Heebo',fontSize:'1rem',textAlign:'center',letterSpacing:3,background:'var(--gray-light)',marginBottom:13 }} />
            {pwError && <p style={{ color:'var(--red)',fontSize:'0.8rem',marginBottom:10 }}>❌ סיסמה שגויה</p>}
            <button className="btn-main" onClick={handleLogin}>כניסה</button>
            <br/><br/>
            <button onClick={onBack} style={{ background:'none',border:'none',color:'var(--gray)',cursor:'pointer',fontSize:'0.8rem',fontFamily:'Heebo' }}>← חזור</button>
          </div>
        </div>
      )}

      {/* ── כותרת ── */}
      <div className="admin-header">
        <h1>🛡️ מנהל מערכת — כל הנתונים</h1>
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={exportXlsx}
            style={{ padding:'9px 20px',borderRadius:9,fontFamily:'Heebo',fontSize:'0.83rem',fontWeight:700,cursor:'pointer',border:'none',background:'var(--green)',color:'white' }}>
            📥 ייצוא לאקסל {isFiltered ? `(${filtered.length})` : ''}
          </button>
          <button onClick={onBack}
            style={{ padding:'9px 20px',borderRadius:9,fontFamily:'Heebo',fontSize:'0.83rem',fontWeight:700,cursor:'pointer',border:'none',background:'rgba(255,255,255,0.1)',color:'white' }}>
            ← יציאה
          </button>
        </div>
      </div>

      <div className="admin-body">

        {/* ── כרטיסי סטטיסטיקה ── */}
        <div className="admin-stat-grid">
          {[
            { v: filtered.length,          l: isFiltered ? 'תוצאות פילטר' : 'סה"כ הגשות' },
            { v: fullCount,                l: 'הגשות מלאות' },
            { v: avgMid != null ? avgMid+'%' : '—', l: 'ממוצע מהלך' },
            { v: avgAll != null ? avgAll+'%' : '—', l: 'ממוצע כללי' },
          ].map(({v,l}) => (
            <div key={l} className="admin-stat-card">
              <div className="asc-val">{v ?? '—'}</div>
              <div className="asc-lbl">{l}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            🔽  שורת פילטרים
        ══════════════════════════════════════ */}
        <div style={{
          display:'flex', gap:12, alignItems:'center', flexWrap:'wrap',
          background:'#f4f7fb', borderRadius:12, padding:'14px 18px',
          margin:'0 0 18px', border:'1.5px solid #dde3ee'
        }}>
          <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#1a3a5c', marginLeft:4 }}>🔽 סינון:</span>

          {/* פילטר המלצה */}
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <label style={{ fontSize:'0.72rem', color:'#888', fontFamily:'Heebo' }}>לפי המלצה</label>
            <select
              value={filterDecision}
              onChange={e => setFilterDecision(e.target.value)}
              style={filterDecision !== 'all' ? activeDropStyle : dropStyle}
            >
              <option value="all">הכל</option>
              <option value="continue">המשך ✅</option>
              <option value="modify">עם שינויים 🔄</option>
              <option value="replace">להחליף ⚠️</option>
              <option value="stop">לא להמשיך ❌</option>
            </select>
          </div>

          {/* פילטר ציון */}
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <label style={{ fontSize:'0.72rem', color:'#888', fontFamily:'Heebo' }}>לפי ציון כולל</label>
            <select
              value={filterColor}
              onChange={e => setFilterColor(e.target.value)}
              style={filterColor !== 'all' ? activeDropStyle : dropStyle}
            >
              <option value="all">הכל</option>
              <option value="green">🟢 ירוק (80%+)</option>
              <option value="yellow">🟡 צהוב (50–79%)</option>
              <option value="red">🔴 אדום (עד 49%)</option>
              <option value="none">⚪ אין ציון</option>
            </select>
          </div>

          {/* פילטר מפקח/ת */}
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <label style={{ fontSize:'0.72rem', color:'#888', fontFamily:'Heebo' }}>לפי מפקח/ת</label>
            <select
              value={filterSupervisor}
              onChange={e => setFilterSupervisor(e.target.value)}
              style={filterSupervisor !== 'all' ? activeDropStyle : dropStyle}
            >
              <option value="all">כל המפקחים</option>
              {supervisors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* כפתור איפוס */}
          {isFiltered && (
            <button onClick={resetFilters} style={{
              marginTop:18, padding:'7px 16px', borderRadius:8, border:'none',
              background:'#e8f3fd', color:'#1a5a9c', fontFamily:'Heebo',
              fontSize:'0.8rem', fontWeight:700, cursor:'pointer'
            }}>
              ✕ נקה פילטרים ({entries.length - filtered.length} מוסתרים)
            </button>
          )}
        </div>
        {/* ══════════════════════════════════════ */}

        {/* ── טבלה ── */}
        {loading ? (
          <p style={{ textAlign:'center', color:'var(--teal)', padding:30 }}>טוען נתונים...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, color:'#888', fontSize:'0.9rem' }}>
            <div style={{ fontSize:'2rem', marginBottom:10 }}>🔍</div>
            {isFiltered ? 'לא נמצאו תוצאות לפי הפילטר הנבחר — נסי לאפס את הפילטרים' : 'אין הגשות עדיין'}
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>סמל מוסד</th>
                  <th>בית ספר</th>
                  <th>מפקח/ת</th>
                  <th>תוכנית</th>
                  <th>תחום</th>
                  <th>שלב א׳</th>
                  <th>שלב ב׳</th>
                  <th>שלב ג׳</th>
                  <th>המלצה</th>
                  <th>עדכון</th>
                  <th>דוח</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const ds = formatDate(e.savedAt);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{e.userName||'—'}</td>
                      <td>{e.userSchool||'—'}</td>
                      <td style={{ fontSize:'.78rem' }}>{e.userSupervisor||'—'}</td>
                      <td style={{ fontSize:'.78rem' }}>{e.fields?.['f-prog']||'—'}</td>
                      <td style={{ fontSize:'.78rem' }}>{e.fields?.['f-domain']||'—'}</td>
                      <td><span className={`abadge ${bc(e.phase1_pct)}`}>{e.phase1_pct||0}%</span></td>
                      <td><span className={`abadge ${bc(e.phase2_pct)}`}>{e.phase2_pct||0}%</span></td>
                      <td><span className={`abadge ${bc(e.phase3_pct)}`}>{e.phase3_pct||0}%</span></td>
                      <td style={{ fontSize:'.78rem' }}>{dh[e.decision]||'—'}</td>
                      <td style={{ fontSize:'.74rem', opacity:0.6 }}>{ds}</td>
                      <td>
                        <button onClick={() => handlePrint(e)}
                          style={{ padding:'5px 10px',borderRadius:7,border:'none',background:'#e8f3fd',
                                   color:'#1a5a9c',fontFamily:'Heebo',fontSize:'0.75rem',
                                   fontWeight:700,cursor:'pointer' }}>
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
