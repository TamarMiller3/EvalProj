import { useState } from 'react';
import { api } from '../api';
import { generateCode } from '../constants/scoreCalc';

const LOGO1 = 'https://res.cloudinary.com/dpwmxprpp/image/upload/v1775323207/WhatsApp_Image_2026-04-04_at_20.18.42_rqrmkh.jpg';
const LOGO2 = 'https://res.cloudinary.com/dpwmxprpp/image/upload/v1775323207/WhatsApp_Image_2026-04-04_at_20.18.42_1_h3k117.jpg';

export function LandingScreen({ onNewUser, onReturnUser, onAdmin }) {
  const [institutionCode, setInstitutionCode] = useState('');
  const [school, setSchool]                   = useState('');
  const [principal, setPrincipal]             = useState('');
  const [code, setCode]                       = useState(generateCode);
  const [returnCode, setReturnCode]           = useState('');
  const [codeReady, setCodeReady]             = useState(false);
  const [error, setError]                     = useState('');
  const [returnError, setReturnError]         = useState('');
  const [loading, setLoading]                 = useState(false);

  async function handleCreate() {
    if (!institutionCode) return setError('יש להכניס סמל מוסד');
    if (!school)          return setError('יש להכניס שם בית הספר');
    if (!principal)       return setError('יש להכניס שם מנהל/ת בית הספר');
    if (!code || code.length < 3) return setError('הקוד חייב להכיל לפחות 3 תווים');
    setLoading(true);
    setError('');
    try {
      await api.createEvaluation(code.toUpperCase(), institutionCode, school);
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

  // ✅ תיקון מובייל: fontSize מוגדר בדיוק 16px בכל שדות הקלט
  // (מתחת ל-16px הטלפון מזום אוטומטית בעת הקלדה)
  const inputStyle = {
    width: '100%',
    border: '2px solid #e0e6ed',
    borderRadius: 10,
    padding: '11px 13px',
    fontSize: '16px',
    background: '#f3f4f6',
    boxSizing: 'border-box',
    fontFamily: 'Heebo, sans-serif',
    direction: 'rtl',
    outline: 'none',
    WebkitAppearance: 'none',
  };

  return (
    <div style={{
      background: 'linear-gradient(140deg,#1a2744 0%,#0d3d5e 55%,#0d7c66 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // ✅ תיקון מובייל: ריפוד מינימלי שמונע גלישה מחוץ למסך
      padding: '12px',
      direction: 'rtl',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        // ✅ תיקון מובייל: ריפוד מצטמצם אוטומטית במסך קטן
        padding: 'clamp(20px, 5vw, 44px) clamp(16px, 6vw, 40px)',
        maxWidth: 460,
        width: '100%',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>

        {/* לוגואים */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <img src={LOGO1} style={{ height: 52, objectFit: 'contain' }} alt="לוגו" />
          <img src={LOGO2} style={{ height: 52, objectFit: 'contain' }} alt="לוגו" />
        </div>

        <div style={{ fontSize: 32, marginBottom: 6 }}>🎓</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a2744', marginBottom: 6, fontFamily: 'Heebo, sans-serif' }}>
          הערכת תוכניות חינוכיות
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 28, lineHeight: 1.6, fontFamily: 'Heebo, sans-serif' }}>
          התבוננות מעמיקה על יישום תוכנית בית ספרית<br />לשימוש מנהלים ואנשי צוות
        </p>

        {/* חזרה עם קוד קיים */}
        <div style={{ background: '#e8f5f2', border: '2px solid #0d7c66', borderRadius: 14, padding: 14, marginBottom: 18 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0d7c66', marginBottom: 10, fontFamily: 'Heebo, sans-serif' }}>
            🔄 כבר יש לך קוד?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={returnCode}
              onChange={e => setReturnCode(e.target.value)}
              placeholder="הקוד שקיבלת"
              style={{ ...inputStyle, flex: 1, letterSpacing: 2, textAlign: 'center', background: 'white', border: '2px solid #0d7c66' }}
            />
            <button
              onClick={handleResume}
              disabled={loading}
              style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#0d7c66', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, sans-serif', whiteSpace: 'nowrap' }}>
              המשך ←
            </button>
          </div>
          {returnError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 6 }}>❌ {returnError}</p>}
        </div>

        {/* מפריד */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0', color: '#6b7280', fontSize: '0.78rem', fontFamily: 'Heebo, sans-serif' }}>
          <span style={{ flex: 1, height: 1, background: '#e0e6ed' }} />
          או — הרשמה ראשונה
          <span style={{ flex: 1, height: 1, background: '#e0e6ed' }} />
        </div>

        {/* סמל מוסד */}
        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a2744', marginBottom: 5, opacity: 0.7, fontFamily: 'Heebo, sans-serif' }}>
            סמל מוסד
          </label>
          <input
            value={institutionCode}
            onChange={e => setInstitutionCode(e.target.value)}
            placeholder="הכנס סמל מוסד"
            disabled={codeReady}
            style={inputStyle}
          />
        </div>

        {/* שם בית הספר */}
        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a2744', marginBottom: 5, opacity: 0.7, fontFamily: 'Heebo, sans-serif' }}>
            שם בית הספר
          </label>
          <input
            value={school}
            onChange={e => setSchool(e.target.value)}
            placeholder="שם בית הספר"
            disabled={codeReady}
            style={inputStyle}
          />
        </div>

        {/* שם מנהל/ת */}
        <div style={{ textAlign: 'right', marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a2744', marginBottom: 5, opacity: 0.7, fontFamily: 'Heebo, sans-serif' }}>
            שם מנהל/ת בית הספר
          </label>
          <input
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            placeholder="שם מנהל/ת בית הספר"
            disabled={codeReady}
            style={{ ...inputStyle, border: '2px solid #0d7c66', background: '#e8f5f2' }}
          />
        </div>

        {/* קוד אישי */}
        <div style={{ textAlign: 'right', marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#1a2744', marginBottom: 5, opacity: 0.7, fontFamily: 'Heebo, sans-serif' }}>
            קוד אישי
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              disabled={codeReady}
              style={{ ...inputStyle, flex: 1, letterSpacing: 2, textAlign: 'center', fontFamily: 'monospace' }}
            />
            {!codeReady && (
              <button
                onClick={() => setCode(generateCode())}
                style={{ padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e0e6ed', background: '#f3f4f6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'Heebo, sans-serif' }}>
                🎲 אוטומטי
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 5, textAlign: 'right', fontFamily: 'Heebo, sans-serif' }}>
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
            <button
              className="btn-main"
              style={{ background: 'linear-gradient(135deg,#1a2744,#243052)' }}
              onClick={() => onNewUser(code, institutionCode, school, principal)}>
              ← המשך למילוי ההערכה
            </button>
          </>
        )}

        <div className="divider">או</div>
        <button
          onClick={onAdmin}
          style={{ width: '100%', padding: 9, background: 'none', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--gray)', fontSize: '0.78rem', fontFamily: 'Heebo, sans-serif' }}>
          🔐 כניסת מנהל מערכת
        </button>

      </div>
    </div>
  );
}
