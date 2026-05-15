import { useState, useRef, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';

export default function BotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'שלום! אני מומחה פדגוגי למדידה והערכה. במה אוכל לעזור?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    if (!text.trim() || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'שגיאה. נסי שוב.' }]);
    }
    setLoading(false);
  }

  const CHIPS = [
    { l: 'שאלון לתלמידים', v: 'אני רוצה לבנות שאלון לתלמידים' },
    { l: 'שאלון למורים', v: 'אני רוצה לבנות שאלון למורים' },
    { l: 'סקר שביעות רצון', v: 'אני רוצה לבנות סקר שביעות רצון' },
    { l: 'תוכנית הערכה', v: 'אני רוצה לבנות תוכנית הערכה' },
  ];

  function renderText(text) {
    return text.split('\n').map((l, i, arr) => (
      <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
    ));
  }

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: 70, left: 20, width: 340, height: 480,
          background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          border: '1px solid #e2e8f0', direction: 'rtl'
        }}>
          <div style={{
            background: '#1a2a4a', color: '#fff', padding: '11px 14px',
            borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
          }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>עוזר הערכה ומדידה</span>
            <button onClick={() => setOpen(false)} style={{ marginRight: 'auto', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 13 }}>X</button>
          </div>

          <div style={{
            background: '#fff8e1', borderBottom: '1px solid #ffe082',
            padding: '7px 12px', fontSize: 11, color: '#7a5f00', flexShrink: 0, textAlign: 'right'
          }}>
            אזהרה: אנא אל תזינו שמות תלמידים, מספרי זהות או נתונים אישיים מזהים
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 4, background: m.role === 'user' ? '#7c3aed' : '#2563eb' }}>
                  {m.role === 'user' ? 'U' : 'B'}
                </div>
                <div style={{ maxWidth: '82%', padding: '8px 11px', borderRadius: 11, fontSize: 12.5, lineHeight: 1.6, background: m.role === 'user' ? '#2563eb' : '#f8fafc', color: m.role === 'user' ? '#fff' : '#1e293b', border: m.role === 'user' ? 'none' : '1px solid #e2e8f0' }}>
                  {renderText(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ padding: '10px 12px', borderRadius: 11, background: '#f8fafc', border: '1px solid #e2e8f0', width: 60 }}>
                ...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '6px 10px', borderTop: '1px solid #e2e8f0' }}>
            {CHIPS.map((c, i) => (
              <button key={i} onClick={() => send(c.v)} disabled={loading}
                style={{ padding: '4px 9px', background: '#fff', border: '1.5px solid #2563eb', borderRadius: 14, fontSize: 11, fontFamily: 'inherit', color: '#2563eb', cursor: 'pointer' }}>
                {c.l}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', padding: '8px 10px', display: 'flex', gap: 6 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input); }}
              placeholder="כתבי כאן..."
              style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '7px 10px', fontSize: 12, outline: 'none', direction: 'rtl', fontFamily: 'inherit' }} />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              style={{ width: 32, height: 32, background: '#2563eb', border: 'none', borderRadius: 9, cursor: 'pointer', color: '#fff', fontSize: 14 }}>
              {"›"}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: 12,
        padding: '8px 14px', cursor: 'pointer', flexShrink: 0
      }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>עוזר מדידה</div>
          <div style={{ fontSize: 10, color: '#b45309' }}>בנה כלי הערכה</div>
        </div>
      </b
