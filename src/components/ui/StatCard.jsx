import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = '#7c3aed', className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-surface rounded-xl p-4 surface-border flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
        )}
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </motion.div>
  );
}
