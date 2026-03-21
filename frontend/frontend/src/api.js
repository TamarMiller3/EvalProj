const BASE = import.meta.env.VITE_API_URL || '/api';
 
// Safe JSON parse — handles empty body or HTML error pages from Render
async function safeJson(res) {
  const text = await res.text();
  if (!text || text.trim() === '') {
    throw new Error('השרת לא הגיב — ייתכן שהוא מתעורר, נסה/י שוב בעוד שניה');
  }
  try {
    return JSON.parse(text);
  } catch {
    // Backend returned HTML (e.g. Render error page or cold-start)
    throw new Error('השרת לא זמין כרגע — נסה/י שוב בעוד מספר שניות');
  }
}
 
export const api = {
  async checkCode(code) {
    const res = await fetch(`${BASE}/evaluations/check/${code}`);
    return safeJson(res);
  },
 
  async loadEvaluation(code) {
    const res = await fetch(`${BASE}/evaluations/${code}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('קוד לא נמצא');
    return safeJson(res);
  },
 
  async createEvaluation(code, userName, userSchool) {
    const res = await fetch(`${BASE}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userName, userSchool })
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'שגיאה ביצירת הערכה');
    return data;
  },
 
  async saveEvaluation(code, payload) {
    const res = await fetch(`${BASE}/evaluations/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'שגיאה בשמירה');
    return data;
  },
 
  async adminLogin(password) {
    const res = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'שגיאה');
    return data;
  },
 
  async adminGetEntries(password) {
    const res = await fetch(`${BASE}/admin/entries`, {
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) throw new Error('Unauthorized');
    return safeJson(res);
  }
};