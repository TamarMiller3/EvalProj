const BASE = '/api';

export const api = {
  async checkCode(code) {
    const res = await fetch(`${BASE}/evaluations/check/${code}`);
    return res.json();
  },

  async loadEvaluation(code) {
    const res = await fetch(`${BASE}/evaluations/${code}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('שגיאה בטעינת הנתונים');
    return res.json();
  },

  async createEvaluation(code, userName, userSchool) {
    const res = await fetch(`${BASE}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userName, userSchool })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'שגיאה ביצירת הערכה');
    return data;
  },

  async saveEvaluation(code, payload) {
    const res = await fetch(`${BASE}/evaluations/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('שגיאה בשמירה');
    return res.json();
  },

  async adminLogin(password) {
    const res = await fetch(`${BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'שגיאה');
    return data;
  },

  async adminGetEntries(password) {
    const res = await fetch(`${BASE}/admin/entries`, {
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  }
};
