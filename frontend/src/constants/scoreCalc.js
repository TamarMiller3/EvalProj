import { VERBALS } from './formFields';

// שלב א׳: 18 צ'קבוקסים + סולם הלימה (fit) = 19 פריטים
export function calcPhase1Score(checks, scales) {
  const total = 19;
  const checked = Object.values(checks).filter(Boolean).length;
  const fitScore = scales?.fit ? (scales.fit - 1) / 3 : 0;
  return Math.round((checked + fitScore) / total * 100);
}

// שלב ב׳: 9 סעיפים (reg1,reg2,qu1-qu5,pr1,pr2)
export function calcPhase2Score(scales) {
  const keys = ['reg1','reg2','qu1','qu2','qu3','qu4','qu5','pr1','pr2'];
  const weight = 100 / keys.length;
  let sum = 0;
  keys.forEach(k => { if (scales[k]) sum += ((scales[k] - 1) / 3) * weight; });
  return Math.round(sum);
}

// שלב ג׳: 3 סעיפים (out1,out2,out4)
export function calcPhase3Score(scales) {
  const keys = ['out1','out2','out4'];
  const weight = 100 / keys.length;
  let sum = 0;
  keys.forEach(k => { if (scales[k]) sum += ((scales[k] - 1) / 3) * weight; });
  return Math.round(sum);
}

export function getVerbal(pct, phase = 0) {
  if (!pct) return '';
  const v = VERBALS[phase] || VERBALS[0];
  if (pct <= 40) return v[0];
  if (pct <= 60) return v[1];
  if (pct <= 80) return v[2];
  if (pct <= 90) return v[3];
  return v[4];
}

export function getEmoji(pct) {
  if (!pct) return '';
  if (pct <= 40) return '🔴';
  if (pct <= 60) return '🟠';
  if (pct <= 80) return '🟡';
  if (pct <= 90) return '🟢';
  return '✅';
}

export function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 3; i++) s += chars[Math.floor(Math.random() * chars.length)];
  s += '-';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function generateInsights(data, scores) {
  const insights = [], actions = [], dataRecs = [];
  const [p1, p2, p3] = scores;

  // Insights
  if (p1 >= 80) insights.push('✅ שלב ההכנה תוכנן היטב — רוב הרכיבים הבסיסיים מולאו.');
  else if (p1 >= 60) insights.push('🟡 שלב ההכנה מולא חלקית — ישנם רכיבים חשובים שטרם הושלמו.');
  else if (p1 > 0) insights.push('🔴 שלב ההכנה דורש השלמה משמעותית — חסרים מדדים יסודיים.');

  if (p2 >= 80) insights.push('✅ יישום התוכנית ברמה גבוהה — סדירות ואיכות ביצוע מספקות.');
  else if (p2 >= 50) insights.push('🟡 יישום התוכנית חלקי — קיימים פערים בסדירות או באיכות.');
  else if (p2 > 0) insights.push('🔴 יישום התוכנית נמוך — נדרשת בחינה מחודשת של אופן ההפעלה.');

  if (p3 >= 80) insights.push('✅ התוצאות מצביעות על אפקטיביות — ישנן עדויות לשינוי בקרב קהל היעד.');
  else if (p3 >= 50) insights.push('🟡 התוצאות חלקיות — ניתן לזהות שינוי, אך טרם הושגו כל היעדים.');
  else if (p3 > 0) insights.push('🔴 התוצאות נמוכות — יש לבחון האם התוכנית מתאימה לצורך שזוהה.');

  if (!data.checks?.c4) insights.push('📌 לא בוצע מיפוי בסיס — ללא נתוני בסיס קשה לאמוד שינוי אמיתי.');
  if (!data.checks?.c18) insights.push('🎯 לא נקבע יעד מדיד — קשה להעריך הצלחה ללא יעד כמותי מוגדר.');
  if (!insights.length) insights.push('מלאו שאלות בשלבים הקודמים לקבלת תובנות.');

  // Actions
  const sc = data.scales || {};
  if (sc.reg1 && sc.reg1 < 3) actions.push('בררו את הגורמים לביטולים ולנשירה — שוחחו עם המנחה ועם התלמידים.');
  if (sc.reg2 && sc.reg2 < 3) actions.push('בדקו האם קהל היעד המקורי עדיין משתתף — שקלו גיוס מחדש.');
  if (sc.qu2 && sc.qu2 < 3) actions.push('שקלו הדרכה ממוקדת למנחה או בחינת חלופה מתאימה יותר.');
  if (sc.qu3 && sc.qu3 < 3) actions.push('בדקו אם מטרות התוכנית מיושמות בפועל — בצעו תצפית על מפגש.');
  if (sc.pr1 && sc.pr1 < 3) actions.push('תכננו נקודת בדיקה — השוו לנתוני בסיס אם קיימים.');
  if (sc.pr2 && sc.pr2 < 3) actions.push('בדקו זמינות תשתיות ומשאבים להמשך — האם נדרש תגבור?');
  if (sc.out1 && sc.out1 < 3) actions.push('נתחו את הפער בין יעדי ההתחלה לתוצאות בפועל.');
  if (sc.out2 && sc.out2 < 3) actions.push('בצעו שיחה עם קהל היעד — מה ניתן לשפר לשנת הלימודים הבאה?');
  if (data.decision === 'modify') actions.push('תכננו את השינויים הנדרשים: מה ישתנה, מי אחראי, מתי מבצעים.');
  if (data.decision === 'replace') actions.push('בצעו מיפוי חלופות — חפשו תוכניות דומות עם עדויות הצלחה.');
  if (data.decision === 'stop') actions.push('תעדו את הלקחים: מה לא עבד ולמה — כדי להימנע מכך בעתיד.');
  if (!actions.length && p1 + p2 + p3 > 0) actions.push('המשיכו לעקוב אחר ההתקדמות ולתעד ממצאים לאורך הדרך.');

  // Data recommendations
  const ch = data.checks || {};
  if (!ch.c4) dataRecs.push('בצעו מדידת בסיס: שאלון, מבחן אבחון, או ציוני כניסה — לפני המפגש הבא.');
  if (!ch.c16) dataRecs.push('הגדירו כלי הערכה ספציפי: שאלון תלמידים, תצפית מובנית, או מבחן ידע.');
  if (!ch.c17) dataRecs.push('קבעו צמתי מדידה בלוח השנה — לפחות בתחילה, באמצע ובסוף התוכנית.');
  if (sc.qu4 && sc.qu4 < 3) dataRecs.push('אספו שביעות רצון תלמידים — שאלון קצר בסוף מפגש מספיק.');
  if (sc.qu5 && sc.qu5 < 3) dataRecs.push('שתפו את הצוות החינוכי — בקשו מהם תצפיות ומשוב שוטף.');
  if (sc.out2 && sc.out2 < 2) dataRecs.push('השוו לנתוני מחוז או ארציים — מאפשר להעריך את גודל ההשפעה.');
  if (sc.out4 && sc.out4 < 3) dataRecs.push('תכננו שיחות הורים ממוקדות — לאיסוף נתונים נוספים על שינויים בבית.');
  if (!dataRecs.length && p1 + p2 + p3 > 0) dataRecs.push('מערכת הנתונים נראית סבירה — המשיכו לתעד ולשמור ממצאים.');

  return { insights, actions, dataRecs };
}
