export const CHARACTER_CLASSES = [
  {
    id: 'warrior',
    name: 'Warrior',
    subtitle: 'Master of Iron',
    icon: 'Sword',
    color: '#ef4444',
    xpMultiplierCategory: 'strength',
    multiplier: 1.25,
    description: 'Warriors specialize in strength training. Earn 25% bonus XP on all strength exercises. Built for lifting heavy and dominating the weight room.',
    statBoosts: [
      { stat: 'Strength XP', value: '+25%' },
      { stat: 'Power', value: '+15' },
      { stat: 'Endurance', value: '+5' },
    ],
  },
  {
    id: 'sprinter',
    name: 'Sprinter',
    subtitle: 'Speed Incarnate',
    icon: 'Zap',
    color: '#2563eb',
    xpMultiplierCategory: 'cardio',
    multiplier: 1.25,
    description: 'Sprinters are built for speed and endurance. Earn 25% bonus XP on all cardio exercises. The fastest path to peak cardiovascular fitness.',
    statBoosts: [
      { stat: 'Cardio XP', value: '+25%' },
      { stat: 'Speed', value: '+20' },
      { stat: 'Stamina', value: '+10' },
    ],
  },
  {
    id: 'yogi',
    name: 'Yogi',
    subtitle: 'Mind & Body',
    icon: 'Leaf',
    color: '#10b981',
    xpMultiplierCategory: 'flexibility',
    multiplier: 1.25,
    description: 'Yogis master the art of flexibility and mindfulness. Earn 25% bonus XP on all flexibility exercises. Balance, flow, and inner strength.',
    statBoosts: [
      { stat: 'Flex XP', value: '+25%' },
      { stat: 'Balance', value: '+25' },
      { stat: 'Recovery', value: '+15' },
    ],
  },
];

export const CLASS_EMOJIS = {
  warrior: '⚔️',
  sprinter: '⚡',
  yogi: '🧘',
};

export const CLASS_BG_GRADIENTS = {
  warrior: 'from-red-900/40 to-surface',
  sprinter: 'from-blue-900/40 to-surface',
  yogi: 'from-green-900/40 to-surface',
};
