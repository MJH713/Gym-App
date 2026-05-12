import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGame } from './context/GameStateContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Workout from './pages/Workout.jsx';
import Quests from './pages/Quests.jsx';
import Achievements from './pages/Achievements.jsx';
import Profile from './pages/Profile.jsx';
import { CHARACTER_CLASSES, CLASS_EMOJIS } from './constants/classes.js';
import Button from './components/ui/Button.jsx';

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const { actions } = useGame();

  const handleComplete = () => {
    if (!username.trim() || !selectedClass) return;
    actions.createProfile(username.trim(), selectedClass);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center space-y-6"
            >
              <div>
                <h1 className="text-5xl font-black text-gradient mb-2">GymQuest</h1>
                <p className="text-gray-400 text-lg">Level up your fitness journey</p>
              </div>

              <div
                className="bg-surface rounded-2xl p-6 surface-border"
                style={{ boxShadow: '0 0 30px rgba(124,58,237,0.15)' }}
              >
                <p className="text-white font-bold text-lg mb-4">What's your warrior name?</p>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && username.trim() && setStep(1)}
                  placeholder="Enter your name..."
                  maxLength={24}
                  className="w-full bg-surface2 rounded-xl px-4 py-3 text-white text-base border border-purple/30 focus:border-purple focus:outline-none placeholder:text-gray-600"
                />
              </div>

              <Button
                variant="primary"
                disabled={!username.trim()}
                onClick={() => setStep(1)}
                className="w-full py-4 text-lg"
              >
                Next →
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-white mb-1">Choose Your Class</h2>
                <p className="text-gray-400 text-sm">This defines your XP bonus category</p>
              </div>

              <div className="space-y-3">
                {CHARACTER_CLASSES.map((cls) => (
                  <motion.button
                    key={cls.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedClass(cls.id)}
                    className="w-full rounded-2xl p-4 text-left transition-all"
                    style={{
                      background: selectedClass === cls.id ? `${cls.color}22` : '#1a1a2e',
                      border: `2px solid ${selectedClass === cls.id ? cls.color : 'rgba(124,58,237,0.2)'}`,
                      boxShadow: selectedClass === cls.id ? `0 0 24px ${cls.color}44` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ background: `${cls.color}22`, border: `1px solid ${cls.color}44` }}
                      >
                        {CLASS_EMOJIS[cls.id]}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-white text-lg">{cls.name}</p>
                        <p className="text-sm font-semibold" style={{ color: cls.color }}>{cls.subtitle}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{cls.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)} className="flex-shrink-0">
                  ← Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedClass}
                  onClick={handleComplete}
                  className="flex-1 py-4 text-base"
                >
                  Begin Your Quest! ⚔️
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppContent() {
  const { profile } = useGame();
  const [page, setPage] = useState('dashboard');
  const [onboarded, setOnboarded] = useState(!!profile);

  // After profile loads, check if we need to show onboarding
  if (!profile && !onboarded) {
    return <OnboardingScreen onComplete={() => setOnboarded(true)} />;
  }

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    workout: <Workout onNavigate={setPage} />,
    quests: <Quests />,
    achievements: <Achievements />,
    profile: <Profile />,
  };

  return (
    <AppShell activePage={page} onNavigate={setPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {pages[page] || pages.dashboard}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
}
