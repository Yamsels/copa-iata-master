"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Play, GraduationCap, Trophy, RotateCcw, Timer as TimerIcon } from "lucide-react";
import Dashboard from "@/components/game/Dashboard";
import RegionSelector from "@/components/game/RegionSelector";
import TriviaEngine from "@/components/game/TriviaEngine";
import { GameState, INITIAL_STATE, Region, Destination, REGIONS_ORDER } from "@/lib/game-logic";
import destinosData from "@/data/destinos.json";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window === "undefined") return INITIAL_STATE;
    const saved = localStorage.getItem("copa_iata_master_v1");
    if (!saved) return INITIAL_STATE;
    try {
      return JSON.parse(saved) as GameState;
    } catch (e) {
      console.error("Failed to load game state", e);
      return INITIAL_STATE;
    }
  });
  const [currentScreen, setCurrentScreen] = useState<"home" | "regions" | "game" | "results">("home");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [gameMode, setGameMode] = useState<"practice" | "exam">("practice");
  const [difficulty, setDifficulty] = useState<"standard" | "challenge">("standard");
  const [lastResult, setLastResult] = useState<{ region: Region, accuracy: number } | null>(null);
  const destinationsByRegion = destinosData as Record<Region, Destination[]>;

  // Save game state
  useEffect(() => {
    localStorage.setItem("copa_iata_master_v1", JSON.stringify(gameState));
  }, [gameState]);

  const totalDestinations = Object.values(destinationsByRegion).flat().length;
  const masteredCount = gameState.masteredCodes.length;

  const handleGameComplete = (accuracy: number) => {
    if (!activeRegion) return;

    setLastResult({ region: activeRegion, accuracy });
    
    setGameState(prev => {
      const newState = { ...prev };
      
      // Update best score
      if (accuracy > (prev.bestScores[activeRegion] || 0)) {
        newState.bestScores[activeRegion] = accuracy;
      }

      // Unlock next region if 90% accuracy
      if (accuracy >= 90) {
        const currentIndex = REGIONS_ORDER.indexOf(activeRegion);
        if (currentIndex < REGIONS_ORDER.length - 1) {
          const nextRegion = REGIONS_ORDER[currentIndex + 1];
          if (!prev.unlockedRegions.includes(nextRegion)) {
            newState.unlockedRegions = [...prev.unlockedRegions, nextRegion];
          }
        }
      }

      // Update mastered codes (only on success)
      const regionDestinations = destinationsByRegion[activeRegion];
      const regionCodes = regionDestinations.map(d => d.iata);
      
      // If accuracy is high, assume mastery of these codes (simplified for now)
      // Real implementation would track per-code, but here we track per-level success
      if (accuracy >= 90) {
        const newMastered = new Set([...prev.masteredCodes, ...regionCodes]);
        newState.masteredCodes = Array.from(newMastered);
      }

      // Update points
      const multiplier = gameMode === "exam" ? 2 : 1;
      const difficultyBonus = difficulty === "challenge" ? 1.5 : 1;
      newState.points += Math.round(accuracy * multiplier * difficultyBonus);

      return newState;
    });

    setCurrentScreen("results");
  };

  return (
    <main className="max-w-xl mx-auto min-h-screen flex flex-col p-4">
      <AnimatePresence mode="wait">
        {currentScreen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-12"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Plane className="w-24 h-24 text-[var(--primary)]" />
              </motion.div>
              <div className="absolute -bottom-2 -right-2 bg-[var(--primary)] text-[#050b18] text-xs font-bold px-2 py-1 rounded-md rotate-12">
                COPA
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-[var(--primary)] bg-clip-text text-transparent">
              Copa IATA Master
            </h1>
            <p className="text-white/60 mb-12 max-w-xs">
              Domina los 85 códigos IATA de la red de Copa Airlines y conviértete en Comandante de Flota.
            </p>

            <button 
              onClick={() => setCurrentScreen("regions")}
              className="btn-primary w-full flex items-center justify-center gap-3 text-lg"
            >
              <Play fill="currentColor" size={20} />
              INICIAR MISIÓN
            </button>
          </motion.div>
        )}

        {currentScreen === "regions" && (
          <motion.div
            key="regions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1"
          >
            <Dashboard 
              points={gameState.points} 
              masteredCount={masteredCount} 
              totalCount={totalDestinations} 
            />
            
            <RegionSelector 
              unlockedRegions={gameState.unlockedRegions}
              bestScores={gameState.bestScores}
              onSelectRegion={(region) => {
                setActiveRegion(region);
                setCurrentScreen("game");
              }}
            />

            {/* Floating button for Exam Mode toggle if region selected */}
          </motion.div>
        )}

        {currentScreen === "game" && activeRegion && (
          <TriviaEngine
            key={`game-engine-${activeRegion}-${gameMode}-${difficulty}`}
            destinations={destinationsByRegion[activeRegion]}
            mode={gameMode}
            difficulty={difficulty}
            onComplete={handleGameComplete}
            onExit={() => setCurrentScreen("regions")}
          />
        )}

        {currentScreen === "results" && lastResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-2xl ${
              lastResult.accuracy >= 90 ? "bg-[var(--success)] shadow-[var(--success)]/20" : "bg-[var(--error)] shadow-[var(--error)]/20"
            }`}>
              <span className="text-4xl font-bold">{lastResult.accuracy}%</span>
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {lastResult.accuracy >= 90 ? "¡Excelente Trabajo!" : "Sigue Practicando"}
            </h2>
            <p className="text-white/60 mb-12 px-6">
              {lastResult.accuracy >= 90 
                ? "Has demostrado un dominio excepcional de esta región. ¡Nuevos destinos desbloqueados!"
                : "Necesitas al menos 90% de precisión para desbloquear el siguiente nivel."}
            </p>

            <div className="w-full space-y-4">
              <button 
                onClick={() => setCurrentScreen("regions")}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Trophy size={20} />
                VOLVER AL DASHBOARD
              </button>
              
              <button 
                onClick={() => setCurrentScreen("game")}
                className="w-full py-4 border border-white/10 rounded-xl flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
              >
                <RotateCcw size={20} />
                REINTENTAR NIVEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Toggle for Game (only visible on regions screen when a region is focused/selected or global) */}
      {currentScreen === "regions" && (
        <div className="fixed bottom-6 left-4 right-4 space-y-2">
          <div className="flex bg-[var(--secondary)] p-1 rounded-2xl border border-white/10 shadow-2xl">
            <button 
              onClick={() => setGameMode("practice")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                gameMode === "practice" ? "bg-[var(--primary)] text-[#050b18] font-bold" : "text-white/40"
              }`}
            >
              <GraduationCap size={18} />
              Práctica
            </button>
            <button 
              onClick={() => setGameMode("exam")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                gameMode === "exam" ? "bg-[var(--primary)] text-[#050b18] font-bold" : "text-white/40"
              }`}
            >
              <TimerIcon size={18} />
              Examen
            </button>
          </div>

          <div className="flex bg-[var(--secondary)] p-1 rounded-2xl border border-white/10 shadow-2xl">
            <button
              onClick={() => setDifficulty("standard")}
              className={`flex-1 py-3 rounded-xl transition-all ${
                difficulty === "standard" ? "bg-[var(--primary)] text-[#050b18] font-bold" : "text-white/40"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setDifficulty("challenge")}
              className={`flex-1 py-3 rounded-xl transition-all ${
                difficulty === "challenge" ? "bg-[var(--primary)] text-[#050b18] font-bold" : "text-white/40"
              }`}
            >
              Desafío
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
