"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Timer as TimerIcon, X, Check } from "lucide-react";
import { Destination } from "@/lib/game-logic";
import confetti from "canvas-confetti";
import playSound from "@/lib/sounds";

interface TriviaEngineProps {
  destinations: Destination[];
  mode: "practice" | "exam";
  difficulty: "standard" | "challenge";
  onComplete: (accuracy: number) => void;
  onExit: () => void;
}

const shuffle = <T,>(array: T[]) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createQuestionPlan = (destinations: Destination[], difficulty: "standard" | "challenge") => {
  const order = difficulty === "challenge"
    ? shuffle(destinations.map((_, i) => i))
    : destinations.map((_, i) => i);
  const modes = order.map(() =>
    difficulty === "challenge" && Math.random() > 0.5 ? "iata_to_city" as const : "city_to_iata" as const
  );
  return { order, modes };
};

export default function TriviaEngine({ destinations, mode, difficulty, onComplete, onExit }: TriviaEngineProps) {
  const { order, modes } = useMemo(() => createQuestionPlan(destinations, difficulty), [destinations, difficulty]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = destinations.length;
  const currentDestination = destinations[order[currentIndex] ?? 0];
  const currentPromptMode = modes[currentIndex] ?? "city_to_iata";

  const cityOptions = useMemo(() => {
    if (!currentDestination || currentPromptMode !== "iata_to_city") return [];
    const distractors = shuffle(
      destinations.filter((d) => d.iata !== currentDestination.iata).map((d) => d.ciudad)
    ).slice(0, 3);
    return shuffle([currentDestination.ciudad, ...distractors]);
  }, [currentDestination, currentPromptMode, destinations]);

  useEffect(() => {
    if (currentPromptMode === "city_to_iata") {
      inputRef.current?.focus();
    }
  }, [currentIndex, currentPromptMode]);

  const finishGame = useCallback((finalCorrectCount: number) => {
    const finalAccuracy = Math.round((finalCorrectCount / totalQuestions) * 100);
    if (finalAccuracy >= 90) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    onComplete(finalAccuracy);
  }, [onComplete, totalQuestions]);

  const goToNextQuestion = useCallback((finalCorrectCount: number, remainingLives: number) => {
    setFeedback(null);
    setTimeLeft(5);
    setUserInput("");
    setSelectedOption(null);

    if (currentIndex < totalQuestions - 1 && remainingLives > 0) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    finishGame(finalCorrectCount);
  }, [currentIndex, finishGame, totalQuestions]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (feedback || !currentDestination) return;

    if (isCorrect) {
      const nextCorrectCount = correctCount + 1;
      setFeedback("correct");
      setCorrectCount(nextCorrectCount);
      playSound("correct");
      setTimeout(() => {
        goToNextQuestion(nextCorrectCount, lives);
      }, 900);
    } else {
      const remainingLives = lives - 1;
      setFeedback("incorrect");
      setLives(remainingLives);
      playSound("incorrect");
    }
  }, [feedback, currentDestination, correctCount, goToNextQuestion, lives]);

  useEffect(() => {
    if (mode === "exam" && !feedback && order.length > 0) {
      if (timeLeft === 0) {
        const timeoutAnswer = setTimeout(() => handleAnswer(false), 0);
        return () => clearTimeout(timeoutAnswer);
      }
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, mode, feedback, order.length, handleAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setUserInput(value);
    
    if (value.length === 3) {
      handleAnswer(value === currentDestination.iata.toUpperCase());
    }
  };

  const handleCloseIncorrectFeedback = () => {
    if (feedback !== "incorrect") return;
    goToNextQuestion(correctCount, lives);
  };

  if (!currentDestination) return null;

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
          <div className="text-xl font-bold">{currentIndex + 1} / {totalQuestions}</div>
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
          {currentPromptMode === "city_to_iata" ? (
            <>
              <h2 className="text-5xl font-bold mb-2 tracking-tight">
                {currentDestination.ciudad.replace(/\s*\(.*?\)\s*/g, "").trim()}
              </h2>
              <p className="text-xl text-[var(--primary)] font-medium opacity-80">{currentDestination.pais}</p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-2">¿Qué ciudad corresponde al código?</p>
              <h2 className="text-6xl font-black mb-4 tracking-[0.2em] text-[var(--primary)]">
                {currentDestination.iata.toUpperCase()}
              </h2>
            </>
          )}
        </motion.div>

        <div className="relative w-full flex flex-col items-center">
          {currentPromptMode === "city_to_iata" ? (
            <motion.input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              disabled={!!feedback}
              placeholder="---"
              className={`iata-input ${feedback === "incorrect" ? "border-[var(--error)] text-[var(--error)]" : ""}`}
              autoFocus
            />
          ) : (
            <div className="w-full grid grid-cols-1 gap-3">
              {cityOptions.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedOption(city);
                    handleAnswer(city === currentDestination.ciudad);
                  }}
                  disabled={!!feedback}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    selectedOption === city
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-white/20 hover:border-[var(--primary)]/70"
                  }`}
                >
                  {city.replace(/\s*\(.*?\)\s*/g, "").trim()}
                </button>
              ))}
            </div>
          )}
          
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className={`absolute -top-20 flex flex-col items-center gap-2 p-4 rounded-3xl ${
                  feedback === 'correct' ? 'bg-[var(--success)]' : 'bg-[var(--error)] shadow-[0_0_30px_var(--error)]'
                }`}
              >
                {feedback === 'correct' ? (
                  <Check className="text-white" size={32} />
                ) : (
                  <>
                    <X className="text-white" size={24} />
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold opacity-60 block">Correcto:</span>
                      <span className="text-2xl font-black">
                        {currentPromptMode === "iata_to_city"
                          ? currentDestination.ciudad.replace(/\s*\(.*?\)\s*/g, "").trim()
                          : currentDestination.iata.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={handleCloseIncorrectFeedback}
                      className="mt-1 rounded-full bg-white/20 p-1 hover:bg-white/35 transition-colors"
                      aria-label="Cerrar resultado"
                    >
                      <X className="text-white" size={16} />
                    </button>
                  </>
                )}
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
