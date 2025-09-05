import { useState, useEffect, useCallback } from 'react';
import type { Cheese } from '../types';
import { GameState } from '../types';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.GENERATING);
  const [dividendA, setDividendA] = useState(0);
  const [divisorB, setDivisorB] = useState(0);
  const [quotient, setQuotient] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [cheeses, setCheeses] = useState<Cheese[]>([]);
  const [message, setMessage] = useState('');
  const [key, setKey] = useState(0); // Used to force re-render on new game

  const generateNewProblem = useCallback(() => {
    let a = 0, b = 0, q = 0;
    
    while (a === 0 || a > 100) {
      b = Math.floor(Math.random() * 9) + 2; // Divisor B from 2 to 10
      // Quotient is from 1 to 10 to match the number scale
      q = Math.floor(Math.random() * 10) + 1; 
      a = b * q;
    }

    setDividendA(a);
    setDivisorB(b);
    setQuotient(q);
    setUserAnswer(null);

    const newCheeses: Cheese[] = [];
    
    // Grid layout parameters
    const numCols = 10;
    const hSpacing = 8.5; // Horizontal spacing in percent
    const vSpacing = 7.5; // Vertical spacing in percent
    const gridWidth = numCols * hSpacing;
    const startLeft = (100 - gridWidth) / 2;
    const startTop = 8;

    for (let i = 0; i < a; i++) {
        // Calculate initial grid position
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        const initialLeft = `${startLeft + col * hSpacing}%`;
        const initialTop = `${startTop + row * vSpacing}%`;

        // Calculate final position inside the box
        const boxIndex = Math.floor(i / q);
        const boxWidth = 100 / b;
        const finalLeftPercent = boxIndex * boxWidth + boxWidth / 2; // Center of the box container
        const finalTopPercent = 85; // A vertical point inside the box

        newCheeses.push({
            id: i,
            gridTop: initialTop,
            gridLeft: initialLeft,
            finalTop: `${finalTopPercent}%`,
            finalLeft: `${finalLeftPercent}%`,
        });
    }

    setCheeses(newCheeses);
    setKey(prev => prev + 1);
    setGameState(GameState.GENERATING);
  }, [ ]);

  useEffect(() => {
    generateNewProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
    let timer: ReturnType<typeof setTimeout>;
    switch (gameState) {
      case GameState.GENERATING:
        timer = setTimeout(() => setGameState(GameState.SHOW_CHEESE), 500);
        break;
      case GameState.SHOW_CHEESE:
        timer = setTimeout(() => setGameState(GameState.SHOW_BOXES), 2000);
        break;
      case GameState.SHOW_BOXES:
        timer = setTimeout(() => setGameState(GameState.AWAITING_INPUT), 500);
        break;
      case GameState.CHECKING:
        if (userAnswer === quotient) {
          setGameState(GameState.SUCCESS);
        } else {
          setMessage(`${userAnswer} × ${divisorB} = ${userAnswer! * divisorB}`);
          setGameState(GameState.FAILURE);
        }
        break;
      case GameState.SUCCESS:
      case GameState.FAILURE:
        timer = setTimeout(() => {
          generateNewProblem();
        }, 3000);
        break;
    }
    return () => clearTimeout(timer);
  }, [gameState, userAnswer, quotient, divisorB, generateNewProblem]);

  const handleSelectAnswer = (num: number) => {
    setUserAnswer(num);
  };

  const handlePackClick = () => {
    if (userAnswer !== null) {
      setGameState(GameState.CHECKING);
    }
  };
  
  const handleScreenClick = () => {
    if(gameState === GameState.SUCCESS || gameState === GameState.FAILURE) {
        generateNewProblem();
    }
  }

  return {
    gameState,
    dividendA,
    divisorB,
    quotient,
    userAnswer,
    cheeses,
    message,
    key,
    handleSelectAnswer,
    handlePackClick,
    handleScreenClick
  };
};