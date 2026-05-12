import { createContext, useContext } from 'react';
import useGameState from '../hooks/useGameState.js';

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const gameState = useGameState();
  return (
    <GameStateContext.Provider value={gameState}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGame must be used within GameStateProvider');
  return ctx;
}
