"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Heart, Timer as TimerIcon, X, Check } from "lucide-react";
import { Destination, Region } from "@/lib/game-logic";
import confetti from "canvas-confetti";
import playSound from "@/lib/sounds";

interface TriviaEngineProps {
  region: Region;
  destinations: Destination[];
  mode: "practice" | "exam";
  onComplete: (accuracy: number) => void;
  onExit: () => void;
}

export default function TriviaEngine({ region, destinations, mode, onComplete, onExit }: TriviaEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDestination = destinations[currentIndex];

  useEffect(() => {
    if (mode === "exam" && !isGameOver && !feedback) {
      if (timeLeft === 0) {
        handleAnswer(false);
      }
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, mode, isGameOver, feedback]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleAnswer = (isCorrect: boolean) => {
    if (feedback) return;

    if (isCorrect) {
      setFeedback("correct");
      setCorrectCount((prev) => prev + 1);
      playSound("correct");
    } else {
      setFeedback("incorrect");
      setLives((prev) => prev - 1);
      playSound("incorrect");
      if (lives <= 1) {
        setIsGameOver(true);
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setTimeLeft(5);
      setUserInput("");
      
      if (currentIndex < destinations.length - 1 && (isCorrect || lives > 1)) {
        setCurrentIndex((prev) => prev + 1);
      } else if (currentIndex === destinations.length - 1 || lives <= 1) {
        const finalAccuracy = Math.round((correctCount + (isCorrect ? 1 : 0)) / destinations.length * 100);
        if (finalAccuracy >= 90) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        onComplete(finalAccuracy);
      }
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setUserInput(value);
    
    if (value.length === 3) {
      handleAnswer(value === currentDestination.iata.toUpperCase());
    }
  };

  if (isGameOver && !feedback) return null; // Logic handled in timeout

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="p-2 opacity-60 hover:opacity-100">
          <X size={24} />
        </button>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i} 
              className={`transition-all ${i < lives ? "text-[var(--error)] fill-[var(--error)]" : "text-white/20"}`} 
              size={24} 
            />
          ))}
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest opacity-60">Progreso</span>
          <div className="text-xl font-bold">{currentIndex + 1} / {destinations.length}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        {mode === "exam" && (
          <div className="mb-8 flex items-center gap-2">
            <TimerIcon className={timeLeft <= 2 ? "text-[var(--error)] animate-pulse" : "text-[var(--primary)]"} />
            <span className={`text-4xl font-mono font-bold ${timeLeft <= 2 ? "text-[var(--error)]" : "text-white"}`}>
              0:0{timeLeft}
            </span>
          </div>
        )}

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-2 tracking-tight">{currentDestination.ciudad}</h2>
          <p className="text-xl text-[var(--primary)] font-medium opacity-80">{currentDestination.pais}</p>
        </motion.div>

        <div className="relative w-full flex flex-col items-center">
          <motion.input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={!!feedback}
            placeholder="---"
            className={`iata-input ${feedback === 'incorrect' ? 'border-[var(--error)] text-[var(--error)]' : ''}`}
            autoFocus
          />
          
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className={`absolute -top-16 p-4 rounded-full ${
                  feedback === 'correct' ? 'bg-[var(--success)]' : 'bg-[var(--error)]'
                }`}
              >
                {feedback === 'correct' ? <Check className="text-white" size={32} /> : <X className="text-white" size={32} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback Visual Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 pointer-events-none z-40 ${
              feedback === 'correct' ? 'bg-[var(--success)]' : 'bg-[var(--error)] animate-shake'
            }`}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
