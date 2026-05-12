import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-surface rounded-2xl shadow-2xl surface-border overflow-hidden"
            style={{ maxWidth: '440px', margin: '0 auto' }}
            initial={{ opacity: 0, scale: 0.9, y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-40%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-purple/20">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Content */}
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
