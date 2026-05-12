import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const TOAST_STYLES = {
  xp: {
    bg: 'rgba(124,58,237,0.95)',
    border: 'rgba(167,139,250,0.5)',
    icon: Icons.Sparkles,
  },
  achievement: {
    bg: 'rgba(245,158,11,0.95)',
    border: 'rgba(252,211,77,0.5)',
    icon: Icons.Trophy,
  },
  levelup: {
    bg: 'rgba(16,185,129,0.95)',
    border: 'rgba(52,211,153,0.5)',
    icon: Icons.Star,
  },
  quest: {
    bg: 'rgba(37,99,235,0.95)',
    border: 'rgba(96,165,250,0.5)',
    icon: Icons.CheckCircle,
  },
};

function Toast({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.xp;
  const IconComp = Icons[toast.icon] || style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 24px ${style.border}`,
        maxWidth: '280px',
      }}
      onClick={() => onRemove(toast.id)}
    >
      <IconComp size={18} className="text-white flex-shrink-0" />
      <p className="text-white text-sm font-semibold leading-tight">{toast.message}</p>
    </motion.div>
  );
}

export default function ToastNotification({ toasts = [], onRemove }) {
  return (
    <div className="fixed top-20 right-3 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
