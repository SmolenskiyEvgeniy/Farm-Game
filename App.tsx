import React from 'react';
import type { CSSProperties } from 'react';
import { GameState } from './types';
import { useGameState } from './hooks/useGameState';
import type { Cheese } from './types';


const CheeseIcon: React.FC<{ className?: string; style?: CSSProperties }> = ({ className, style }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={`w-10 h-10 sm:w-12 sm:h-12 ${className}`}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M95 50C95 25.1472 74.8528 5 50 5C25.1472 5 5 25.1472 5 50L50 95L95 50Z" fill="#FFD700" stroke="#FDB813" strokeWidth="4"/>
        <circle cx="30" cy="45" r="5" fill="#FDB813" />
        <circle cx="50" cy="35" r="7" fill="#FDB813" />
        <circle cx="70" cy="50" r="6" fill="#FDB813" />
        <circle cx="55" cy="65" r="5" fill="#FDB813" />
    </svg>
);

const BoxIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={`w-20 h-20 sm:w-24 sm:h-24 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5 25L20 5H80L95 25V95H5V25Z" fill="#A0522D" stroke="#654321" strokeWidth="4"/>
        <path d="M5 25L50 45L95 25" stroke="#654321" strokeWidth="4" fill="none"/>
        <path d="M20 5L50 25L80 5" stroke="#654321" strokeWidth="4" fill="none"/>
        <line x1="50" y1="25" x2="50" y2="45" stroke="#654321" strokeWidth="4"/>
    </svg>
);

const SadCharacterIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg 
        viewBox="0 0 100 100"
        className={`w-24 h-24 sm:w-32 sm:h-32 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="50" cy="50" r="45" fill="#FFDDC1" stroke="#E4A07E" strokeWidth="4"/>
        <circle cx="35" cy="40" r="5" fill="#5C3317"/>
        <circle cx="65" cy="40" r="5" fill="#5C3317"/>
        <path d="M35 70 Q 50 55 65 70" stroke="#5C3317" strokeWidth="4" fill="none"/>
        <path d="M20 30 C 25 20, 35 20, 40 25" stroke="#5C3317" strokeWidth="3" fill="none"/>
        <path d="M80 30 C 75 20, 65 20, 60 25" stroke="#5C3317" strokeWidth="3" fill="none"/>
    </svg>
);


const App: React.FC = () => {
    const { 
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
    } = useGameState();

    const getCheeseStyle = (cheese: Cheese, index: number): CSSProperties => {
        const centeredTransform = 'translateX(-50%)';
        const gridStyle: CSSProperties = { top: cheese.gridTop, left: cheese.gridLeft, transform: 'scale(1)', opacity: 1 };
        const finalStyle: CSSProperties = { 
            top: cheese.finalTop, 
            left: cheese.finalLeft, 
            transform: `${centeredTransform} scale(0.2)`,
            opacity: 0,
        };

        if (gameState === GameState.SUCCESS) {
            const boxIndex = Math.floor(index / quotient);
            const cheeseIndexInBox = index % quotient;
            const delay = boxIndex * 150 + cheeseIndexInBox * 25;

            return {
                ...finalStyle,
                transitionDelay: `${delay}ms`,
            };
        }

        if ((gameState === GameState.AWAITING_INPUT || gameState === GameState.FAILURE) && userAnswer !== null && userAnswer > 0) {
            const numPerBox = userAnswer;
            const boxWidth = 100 / divisorB;
            const vSpacing = 6; // Vertical spacing between cheeses in a column
            const bottomAlignmentPoint = 78; // Vertical position where the bottom of the column should align (just above boxes)

            // Calculate the total height of one cheese column
            const columnHeight = numPerBox * vSpacing;
            // Calculate the dynamic starting top position to align the bottom of the column
            const dynamicVStart = bottomAlignmentPoint - columnHeight;

            const getStagingStyle = (boxIndex: number, cheeseIndexInCol: number): CSSProperties => ({
                top: `${dynamicVStart + cheeseIndexInCol * vSpacing}%`,
                left: `${boxIndex * boxWidth + boxWidth / 2}%`,
                transform: `${centeredTransform} scale(1)`,
                opacity: 1,
            });

            const boxIndex = Math.floor(index / numPerBox);
            const cheeseIndexInCol = index % numPerBox;

            if (boxIndex < divisorB) {
                return getStagingStyle(boxIndex, cheeseIndexInCol);
            } else {
                return gridStyle;
            }
        }
        
        return gridStyle;
    };


    const renderTopText = () => {
        let content;
        switch (gameState) {
            case GameState.SHOW_CHEESE:
                content = dividendA;
                break;
            case GameState.SHOW_BOXES:
            case GameState.AWAITING_INPUT:
            case GameState.CHECKING:
            case GameState.FAILURE:
                content = `${dividendA} : ${divisorB}`;
                break;
            case GameState.SUCCESS:
                content = `${dividendA} : ${divisorB} = ${dividendA / divisorB}`;
                break;
            default:
                return null;
        }
        return (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-300 bg-opacity-70 text-white font-bold text-3xl sm:text-5xl px-6 py-2 rounded-xl shadow-lg animate-fade-in z-10">
                {content}
            </div>
        )
    };
    
    return (
        <div 
            key={key} 
            className="w-screen h-screen bg-gradient-to-b from-sky-400 to-green-500 font-sans overflow-hidden relative"
            onClick={handleScreenClick}
        >

            {renderTopText()}

            <div className="w-full h-full relative">
                {gameState >= GameState.SHOW_CHEESE && cheeses.map((cheese, index) => {
                    const isPreviewing = (gameState === GameState.AWAITING_INPUT && userAnswer !== null) || gameState === GameState.FAILURE;
                    const transitionClass = isPreviewing ? 'duration-500' : 'duration-[1500ms]';

                    return (
                         <CheeseIcon 
                            key={cheese.id}
                            className={`absolute transition-all ease-in-out ${transitionClass}`}
                            style={getCheeseStyle(cheese, index)}
                        />
                    );
                })}
            </div>

            {gameState === GameState.SUCCESS && (
                <div className="absolute inset-0 bg-black bg-opacity-25 flex justify-center items-center animate-fade-in z-20">
                    <div className="bg-green-600 text-white font-bold text-4xl sm:text-6xl px-12 py-6 rounded-2xl shadow-2xl">
                        Заказ готов!
                    </div>
                </div>
            )}

            {gameState === GameState.FAILURE && (
                <div className="absolute inset-0 bg-black bg-opacity-25 flex flex-col justify-center items-center animate-fade-in z-20">
                    <div className="bg-red-600 text-white font-bold text-4xl sm:text-6xl px-12 py-6 rounded-2xl shadow-2xl mb-4">
                        Ошибка!
                    </div>
                     <div className="bg-yellow-300 bg-opacity-70 text-white font-bold text-3xl sm:text-5xl px-6 py-2 rounded-xl shadow-lg">
                        {message}
                    </div>
                    <SadCharacterIcon className="absolute bottom-4 right-4" />
                </div>
            )}
            
            <div className="absolute bottom-0 w-full flex flex-col items-center pb-4 z-10">
                <div className={`w-full flex items-end transition-opacity duration-500 ${gameState >= GameState.SHOW_BOXES ? 'opacity-100' : 'opacity-0'}`}>
                    {Array.from({ length: divisorB }).map((_, i) => (
                        <div key={i} className="flex justify-center" style={{ width: `${100 / divisorB}%` }}>
                           <BoxIcon />
                        </div>
                    ))}
                </div>

                {gameState === GameState.AWAITING_INPUT && (
                    <div className="mt-4 flex flex-col items-center space-y-4 animate-fade-in">
                        <div className="flex flex-wrap justify-center gap-2 px-2">
                           {Array.from({ length: 11 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectAnswer(i)}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-xl sm:text-2xl font-bold shadow-md transition-all duration-200 
                                    ${userAnswer === i 
                                        ? 'bg-orange-500 text-white scale-110' 
                                        : 'bg-white text-blue-600 hover:bg-yellow-200'
                                    }`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handlePackClick}
                            disabled={userAnswer === null}
                            className="w-48 h-12 bg-green-600 text-white text-2xl font-bold rounded-lg shadow-lg transition-all duration-300
                            hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Упаковать
                        </button>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default App;