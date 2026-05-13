import { useState } from 'react';
import { api } from '../api';
import { generateCode } from '../constants/scoreCalc';

export function LandingScreen({ onNewUser, onReturnUser, onAdmin }) {
  const [name, setName]             = useState('');
  const [school, setSchool]         = useState('');
  const [principal, setPrincipal]   = useState('');
  const [code, setCode]             = useState(generateCode);
  const [codeReady, setCodeReady]   = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // חיפוש לפי סמל מוסד
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = לא חיפשנו, [] = אין תוצאות
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  async function handleSearch() {
    if (!searchSymbol.trim()) return setSearchError('יש להכניס סמל מוסד');
    setSearchLoading(true);
    setSearchError('');
    setSearchResults(null);
    try {
      const results = await api.getBySchool(searchSymbol.trim());

      if (results.length === 0) {
        // לא נמצא
        setSearchError('לא נמצאו הערכות עבור סמל מוסד זה');
      } else if (results.length === 1) {
        // תוצאה אחת — טוען ישירות
        onReturnUser(results[0].userCode || results[0].code, results[0]);
      } else {
        // מספר תוכניות — מציג רשימה לבחירה
        setSearchResults(results);
      }
    } catch (e) {
      setSearchError('שגיאה בחיפוש — ' + e.message);
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSelectEval(item) {
    onReturnUser(item.userCode || item.code, item);
  }

  async function handleCreate() {
    if (!name)      return setError('יש להכניס סמל מוסד');
    if (!school)    return setError('יש להכניס שם בית הספר');
    if (!principal) return setError('יש להכניס שם מנהל/ת');
    if (!code || code.length < 3) return setError('הקוד חייב להכיל לפחות 3 תווים');
    setLoading(true);
    setError('');
    try {
      await api.createEvaluation(code.toUpperCase(), name, school);
      setCodeReady(true);
    } catch (e) {
      setError(e.message === 'קוד זה כבר תפוס' ? 'קוד זה כבר תפוס — נסה/י קוד אחר' : e.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('he-IL');
  }

  return (
    <div className="screen landing-screen" style={{ display: 'flex' }}>
      <div className="landing-card">

        {/* לוגואים */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <img
            src="https://res.cloudinary.com/dpwmxprpp/image/upload/v1775323207/WhatsApp_Image_2026-04-04_at_20.18.42_rqrmkh.jpg"
            alt="היחידה לתכנון, פיתוח והערכה"
            style={{ height: 56, width: 'auto', objectFit: 'contain' }}
          />
          <img
            src="https://res.cloudinary.com/dpwmxprpp/image/upload/v1775323207/WhatsApp_Image_2026-04-04_at_20.18.42_1_h3k117.jpg"
            alt="משרד החינוך מחוז חיפה"
            style={{ height: 56, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--navy)', marginBottom: 5 }}>
          הערכת תוכניות חינוכיות
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--gray)', marginBottom: 24, lineHeight: 1.6 }}>
          התבוננות מעמיקה על יישום תוכנית בית ספרית
        </div>

        {/* ===== חזרה לדוח קיים ===== */}
        <div style={{ background: '#e8f5f2', border: '2px solid var(--teal)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--teal)', marginBottom: 10, textAlign: 'right' }}>
            חזרה לדוח קיים — חיפוש לפי סמל מוסד
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={searchSymbol}
              onChange={e => { setSearchSymbol(e.target.value); setSearchResults(null); setSearchError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="הכנס/י סמל מוסד"
              style={{ flex: 1, border: '2px solid var(--teal)', borderRadius: 10, padding: '10px 13px',
                       fontFamily: 'Heebo', fontSize: '1rem', textAlign: 'center',
                       background: 'white', outline: 'none' }}
            />
            <button onClick={handleSearch} disabled={searchLoading}
              style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--teal)',
                       color: 'white', fontFamily: 'Heebo', fontSize: '0.88rem', fontWeight: 700,
                       cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {searchLoading ? '...' : 'חפש'}
            </button>
          </div>

          {searchLoading && (
            <p style={{ fontSize: '0.78rem', color: 'var(--teal)', marginTop: 8, textAlign: 'right' }}>
              מחפש... ייתכן שהשרת מתעורר, אנא המתן עד 30 שניות
            </p>
          )}

          {searchError && (
            <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 8, textAlign: 'right' }}>
              {searchError}
            </p>
          )}

          {/* רשימת תוצאות */}
          {searchResults && searchResults.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8, textAlign: 'right' }}>
                נמצאו {searchResults.length} הערכות — בחר/י:
              </div>
              {searchResults.map((item, i) => (
                <div key={i}
                  style={{ background: 'white', borderRadius: 8, padding: '10px 12px', marginBottom: 6,
                           border: '1.5px solid var(--border)', display: 'flex',
                           justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => handleSelectEval(item)}
                    style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: 'var(--teal)',
                             color: 'white', fontFamily: 'Heebo', fontSize: '0.8rem',
                             fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    כניסה
                  </button>
                  <div style={{ textAlign: 'right', flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {item.fields?.['f-prog'] || 'ללא שם תוכנית'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray)', marginTop: 2 }}>
                      {item.userSchool && `${item.userSchool} | `}
                      עדכון אחרון: {formatDate(item.savedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider">או — הרשמה ראשונה</div>

        <div className="fg">
          <label>סמל מוסד</label>
          <input value={name} onChange={e => setName(e.target.value)}
                 placeholder="הכנס/י את סמל המוסד" disabled={codeReady} />
        </div>

        <div className="fg">
          <label>שם בית הספר</label>
          <input value={school} onChange={e => setSchool(e.target.value)}
                 placeholder="שם בית הספר" disabled={codeReady} />
        </div>

        <div className="fg">
          <label>שם מנהל/ת בית הספר</label>
          <input value={principal} onChange={e => setPrincipal(e.target.value)}
                 placeholder="שם מנהל/ת" disabled={codeReady} />
        </div>

        <div className="fg" style={{ marginBottom: 6 }}>
          <label>קוד אישי</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="קוד לבחירתך" disabled={codeReady}
              style={{ flex: 1, letterSpacing: 2, fontFamily: 'monospace', fontSize: '1rem',
                       border: '2px solid var(--border)', borderRadius: 10, padding: '11px 13px',
                       background: 'var(--gray-light)' }}
            />
            {!codeReady && (
              <button onClick={() => setCode(generateCode())}
                style={{ flexShrink: 0, padding: '10px 12px', borderRadius: 9,
                         border: '1.5px solid var(--border)', background: 'var(--gray-light)',
                         cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Heebo', fontWeight: 700 }}>
                אוטומטי
              </button>
            )}
          </div>
        </div>

        {error && <p className="err-line">❌ {error}</p>}

        {loading && (
          <p style={{ fontSize: '0.78rem', color: 'var(--teal)', textAlign: 'center', margin: '8px 0' }}>
            מתחבר לשרת, אנא המתן עד 30 שניות...
          </p>
        )}

        {!codeReady && (
          <button className="btn-main" onClick={handleCreate} disabled={loading}>
            {loading ? 'מתחבר...' : 'צור קוד והתחל/י'}
          </button>
        )}

        {codeReady && (
          <>
            <div className="code-display">{code}</div>
            <div className="code-warn">⚠️ <strong>שמור/י את הקוד!</strong> תצטרך/י אותו כדי לחזור ולהמשיך.</div>
            <button className="btn-main" style={{ background: 'linear-gradient(135deg,#1a2744,#243052)' }}
              onClick={() => onNewUser(code, name, school, principal)}>
              המשך למילוי ההערכה
            </button>
          </>
        )}

        <div className="divider">או</div>
        <button onClick={onAdmin}
          style={{ width: '100%', padding: 9, background: 'none', border: '1.5px dashed var(--border)',
                   borderRadius: 8, cursor: 'pointer', color: 'var(--gray)',
                   fontSize: '0.78rem', fontFamily: 'Heebo' }}>
          כניסת מנהל מערכת
        </button>
      </div>
    </div>
  );
}
