import { useState, useRef, useCallback } from 'react';
import { api } from '../api';
import { CHECKS, SCALES, NOTES, FIELDS } from '../constants/formFields';
import { calcPhase1Score, calcPhase2Score, calcPhase3Score } from '../constants/scoreCalc';

const initChecks = () => Object.fromEntries(CHECKS.map(k => [k, false]));
const initScales = () => Object.fromEntries(SCALES.map(k => [k, null]));
const initNotes  = () => Object.fromEntries(NOTES.map(k => [k, '']));
const initFields = () => Object.fromEntries(FIELDS.map(k => [k, '']));

export function useEvaluation() {
  const [userCode, setUserCode]     = useState(null);
  const [userName, setUserName]     = useState('');
  const [userSchool, setUserSchool] = useState('');
  const [fields, setFields]         = useState(initFields());
  const [checks, setChecks]         = useState(initChecks());
  const [scales, setScales]         = useState(initScales());
  const [notes, setNotes]           = useState(initNotes());
  const [decision, setDecision]     = useState('');
  const [saving, setSaving]         = useState(false);
  const [lastSaved, setLastSaved]   = useState(null);
  const autoSaveTimer               = useRef(null);

  // שלב א׳ מקבל גם scales כי סולם fit נכלל בחישוב
  const scores = [
    calcPhase1Score(checks, scales),
    calcPhase2Score(scales),
    calcPhase3Score(scales)
  ];

  const collectData = useCallback(() => ({
    userCode, userName, userSchool,
    fields, checks, scales, notes, decision,
    savedAt: new Date().toISOString(),
    phase1_pct: scores[0],
    phase2_pct: scores[1],
    phase3_pct: scores[2]
  }), [userCode, userName, userSchool, fields, checks, scales, notes, decision, scores]);

  const save = useCallback(async (showFeedback = true) => {
    if (!userCode) return;
    setSaving(true);
    try {
      await api.saveEvaluation(userCode, collectData());
      setLastSaved(new Date());
      return true;
    } catch {
      if (showFeedback) throw new Error('שגיאה בשמירה');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userCode, collectData]);

  const scheduleSave = useCallback(() => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => save(false), 1500);
  }, [save]);

  const setField = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
    scheduleSave();
  };

  const setCheck = (key, value) => {
    setChecks(prev => ({ ...prev, [key]: value }));
    scheduleSave();
  };

  const setScale = (key, value) => {
    setScales(prev => ({ ...prev, [key]: value }));
    scheduleSave();
  };

  const setNote = (key, value) => {
    setNotes(prev => ({ ...prev, [key]: value }));
    scheduleSave();
  };

  const loadData = (data) => {
    if (data.fields)   setFields(prev => ({ ...initFields(), ...data.fields }));
    if (data.checks)   setChecks(prev => ({ ...initChecks(), ...data.checks }));
    if (data.scales)   setScales(prev => ({ ...initScales(), ...data.scales }));
    if (data.notes)    setNotes(prev => ({ ...initNotes(), ...data.notes }));
    if (data.decision) setDecision(data.decision);
  };

  return {
    userCode, setUserCode,
    userName, setUserName,
    userSchool, setUserSchool,
    fields, setField,
    checks, setCheck,
    scales, setScale,
    notes, setNote,
    decision, setDecision,
    scores, saving, lastSaved,
    save, scheduleSave, loadData, collectData
  };
}
