import { useState } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';


export function AdminScreen({ onBack, active }) {
  const [authed, setAuthed]     = useState(false);
  const [pw, setPw]             = useState('');
  const [pwError, setPwError]   = useState(false);
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(false);

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

  function exportXlsx() {
    if (!entries.length) return;
    const dh = { continue: 'להמשיך', modify: 'עם שינויים', replace: 'להחליף', stop: 'לא להמשיך' };
    const H = ['שם', 'בית ספר', 'קוד', 'תוכנית', 'שנה', 'קהל יעד', 'תחום', 'שלב-א-%', 'מהלך-%', 'תוצאות-%', 'החלטה', 'תאריך'];
    const rows = entries.map(e => [
      e.userName, e.userSchool, e.userCode,
      e.fields?.['f-prog'] || '', e.fields?.['f-year'] || '',
      e.fields?.['f-target'] || '', e.fields?.['f-domain'] || '',
      (e.phase1_pct || 0) + '%', (e.phase2_pct || 0) + '%', (e.phase3_pct || 0) + '%',
      dh[e.decision] || '',
      new Date(e.savedAt).toLocaleString('he-IL')
    ]);
    const ws = XLSX.utils.aoa_to_sheet([H, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'נתונים');
    XLSX.writeFile(wb, `RAMA_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.xlsx`);
  }

  const bc = v => !v ? 'ab-y' : v >= 80 ? 'ab-g' : v >= 50 ? 'ab-y' : 'ab-r';
  const dh = { continue: 'המשך', modify: 'עם שינויים', replace: 'להחליף', stop: 'לא להמשיך' };

  return (
    <div className={`screen admin-screen${active ? ' active' : ''}`} style={{ display: 'flex' }}>
      {/* Login overlay */}
      {!authed && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 38, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem' }}>🔐</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', margin: '10px 0 5px' }}>כניסת מנהל מערכת</h2>
            <p style={{ fontSize: '0.81rem', color: 'var(--gray)', marginBottom: 22 }}>הכנס/י את סיסמת המנהל</p>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
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

      {/* Admin panel */}
      <div className="admin-header">
        <h1>🛡️ מנהל מערכת — כל הנתונים</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportXlsx} style={{ padding: '9px 20px', borderRadius: 9, fontFamily: 'Heebo', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'var(--green)', color: 'white' }}>📥 ייצוא לאקסל</button>
          <button onClick={onBack}      style={{ padding: '9px 20px', borderRadius: 9, fontFamily: 'Heebo', fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}>← יציאה</button>
        </div>
      </div>

      <div className="admin-body">
        {/* Stats */}
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

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <table className="atable">
            <thead>
              <tr>
                <th>שם</th><th>בית ספר</th><th>תוכנית</th><th>תחום</th>
                <th>הכנה</th><th>מהלך</th><th>תוצאות</th><th>החלטה</th><th>עדכון</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 44, color: 'rgba(255,255,255,0.35)' }}>טוען...</td></tr>}
              {!loading && !entries.length && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 44, color: 'rgba(255,255,255,0.35)' }}>אין נתונים עדיין</td></tr>}
              {entries.map((e, i) => {
                const dt = new Date(e.savedAt);
                const ds = dt.toLocaleDateString('he-IL') + ' ' + dt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                return (
                  <tr key={i}>
                    <td><strong>{e.userName || '—'}</strong></td>
                    <td>{e.userSchool || '—'}</td>
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
