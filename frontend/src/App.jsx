import { useState, useEffect, useRef } from 'react';
import { useEvaluation } from './hooks/useEvaluation';
import { LandingScreen }  from './components/LandingScreen';
import { PhaseAScreen }   from './components/PhaseAScreen';
import { PhaseBScreen }   from './components/PhaseBScreen';
import { PhaseCScreen }   from './components/PhaseCScreen';
import { SummaryScreen }  from './components/SummaryScreen';
import { AdminScreen }    from './components/AdminScreen';
import './styles/global.css';

const SCREENS = ['landing', 'phase0', 'phase1', 'phase2', 'phase3', 'admin'];

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [prevScreen, setPrev] = useState(null);
  const [toast, setToast] = useState({ msg: '', show: false, color: 'var(--navy)' });
  const evalState = useEvaluation();

  // Override save to show toast
  const originalSave = evalState.save;
  const saveWithToast = async (show = true) => {
    try {
      await originalSave(show);
      if (show) showToast('✅ ההערכה נשמרה!', 'var(--teal)');
    } catch {
      if (show) showToast('שגיאה בשמירה', '#c0392b');
    }
  };

  function showToast(msg, color = 'var(--navy)') {
    setToast({ msg, show: true, color });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }

  function goTo(nextScreen) {
    setPrev(screen);
    setScreen(nextScreen);
  }
function handleNewUser(code, name, school, principal) {
  evalState.setUserCode(code);
  evalState.setUserName(name);
  evalState.setUserSchool(school);
  evalState.setUserPrincipal(principal); // חדש
  goTo('phase0');
}
  function handleReturnUser(code, data) {
    evalState.setUserCode(code);
    evalState.setUserName(data.userName || '');
    evalState.setUserSchool(data.userSchool || '');
    evalState.loadData(data);
    goTo('phase0');
    showToast('✅ ברוך/ה השב/ה! הנתונים נטענו', 'var(--teal)');
  }

  const ev = { ...evalState, save: saveWithToast };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <LandingScreen
        onNewUser={handleNewUser}
        onReturnUser={handleReturnUser}
        onAdmin={() => goTo('admin')}
        active={screen === 'landing'}
        style={{ transform: screen === 'landing' ? 'none' : undefined }}
      />
      <PhaseAScreen eval={ev} active={screen === 'phase0'}
        onNext={() => { ev.save(false); goTo('phase1'); }} />
      <PhaseBScreen eval={ev} active={screen === 'phase1'}
        onPrev={() => { ev.save(false); goTo('phase0'); }}
        onNext={() => { ev.save(false); goTo('phase2'); }} />
      <PhaseCScreen eval={ev} active={screen === 'phase2'}
        onPrev={() => { ev.save(false); goTo('phase1'); }}
        onNext={() => { ev.save(false); goTo('phase3'); }} />
      <SummaryScreen eval={ev} active={screen === 'phase3'}
        onPrev={() => { ev.save(false); goTo('phase2'); }} />
      <AdminScreen active={screen === 'admin'} onBack={() => goTo('landing')} />

      {/* Toast */}
      <div className={`toast${toast.show ? ' show' : ''}`} style={{ background: toast.color }}>
        {toast.msg}
      </div>
    </div>
  );
}
