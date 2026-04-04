import { useState } from 'react';
import { api } from '../api';
import { generateCode } from '../constants/scoreCalc';

export function LandingScreen({ onNewUser, onReturnUser, onAdmin }) {
  const [name, setName]       = useState('');
  const [school, setSchool]   = useState('');
  const [code, setCode]       = useState(generateCode);
  const [returnCode, setReturnCode] = useState('');
  const [codeReady, setCodeReady]   = useState(false);
  const [error, setError]     = useState('');
  const [returnError, setReturnError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name)   return setError('יש להכניס שם');
    if (!school) return setError('יש להכניס שם בית הספר');
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

  async function handleResume() {
    if (!returnCode) return setReturnError('יש להכניס קוד');
    setLoading(true);
    setReturnError('');
    try {
      const data = await api.loadEvaluation(returnCode.toUpperCase());
      if (!data) { setReturnError('קוד לא נמצא. בדוק/י את הקוד ונסה/י שוב.'); return; }
      onReturnUser(returnCode.toUpperCase(), data);
    } catch {
      setReturnError('קוד לא נמצא. בדוק/י את הקוד ונסה/י שוב.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen landing-screen" style={{ display: 'flex' }}>
      <div className="landing-card">

        {/* סמלים */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <img src="./logo-unit.png"      alt="היחידה לתכנון, פיתוח והערכה" style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
          <img src="./logo-education.png" alt="משרד החינוך מחוז חיפה"       style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ fontSize: '2rem', marginBottom: 4 }}>🎓</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--navy)', marginBottom: 5 }}>
          הערכת תוכניות חינוכיות
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--gray)', marginBottom: 32, lineHeight: 1.6 }}>
          התבוננות מעמיקה על יישום תוכנית בית ספרית<br />לשימוש מנהלים ואנשי צוות
        </div>

        {/* כניסה עם קוד קיים */}
        <div style={{ background: '#e8f5f2', border: '2px solid var(--teal)', borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>
            🔄 כבר יש לך קוד? הכנס/י כאן
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={returnCode}
              onChange={e => setReturnCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleResume()}
              onPaste={e => {
                e.preventDefault();
                const text = e.clipboardData.getData('text').trim().toUpperCase();
                setReturnCode(text);
              }}
              placeholder="הקוד שקיבלת"
              style={{ flex: 1, border: '2px solid var(--teal)', borderRadius: 10, padding: '10px 13px', fontFamily: 'Heebo', fontSize: '1rem', letterSpacing: 2, textAlign: 'center', background: 'white', outline: 'none' }}
            />
            <button onClick={handleResume} disabled={loading}
              style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--teal)', color: 'white', fontFamily: 'Heebo', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
              המשך ←
            </button>
          </div>
          {returnError && <p className="err-line" style={{ marginTop: 8 }}>❌ {returnError}</p>}
        </div>

        <div className="divider">או — הרשמה ראשונה</div>

        <div className="fg"><label>שמך המלא</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="הכנס את שמך" disabled={codeReady} />
        </div>
        <div className="fg"><label>שם בית הספר</label>
          <input value={school} onChange={e => setSchool(e.target.value)} placeholder="שם בית הספר" disabled={codeReady} />
        </div>
        <div className="fg" style={{ marginBottom: 6 }}>
          <label>קוד אישי</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="קוד לבחירתך" disabled={codeReady}
              style={{ flex: 1, letterSpacing: 2, fontFamily: 'monospace', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: 10, padding: '11px 13px', background: 'var(--gray-light)' }}
            />
            {!codeReady && (
              <button onClick={() => setCode(generateCode())}
                style={{ flexShrink: 0, padding: '10px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--gray-light)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Heebo', fontWeight: 700 }}>
                🎲 אוטומטי
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--gray)', marginTop: 5, textAlign: 'right' }}>
            מומלץ: שם + מספר, למשל <strong>tamar42</strong>
          </p>
        </div>

        {error && <p className="err-line">❌ {error}</p>}

        {!codeReady && (
          <button className="btn-main" onClick={handleCreate} disabled={loading}>
            ✨ צור קוד והתחל/י
          </button>
        )}

        {codeReady && (
          <>
            <div className="code-display">{code}</div>
            <div className="code-warn">⚠️ <strong>שמור/י את הקוד!</strong> תצטרך/י אותו כדי לחזור ולהמשיך.</div>
            <button className="btn-main" style={{ background: 'linear-gradient(135deg,#1a2744,#243052)' }}
              onClick={() => onNewUser(code, name, school)}>
              ← המשך למילוי ההערכה
            </button>
          </>
        )}

        <div className="divider">או</div>
        <button onClick={onAdmin}
          style={{ width: '100%', padding: 9, background: 'none', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--gray)', fontSize: '0.78rem', fontFamily: 'Heebo' }}>
          🔐 כניסת מנהל מערכת
        </button>
      </div>
    </div>
  );
}
