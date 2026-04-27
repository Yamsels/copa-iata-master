"use client";

import React from "react";
import { Lock, ChevronRight, CheckCircle2 } from "lucide-react";
import { Region, REGIONS_ORDER } from "@/lib/game-logic";
import { motion } from "framer-motion";

interface RegionSelectorProps {
  unlockedRegions: Region[];
  bestScores: Record<Region, number>;
  onSelectRegion: (region: Region) => void;
}

const REGION_NAMES: Record<Region, string> = {
  Norteamerica: "Norteamérica",
  Centroamerica: "Centroamérica",
  Caribe: "Caribe",
  Colombia: "Colombia",
  Brasil: "Brasil",
  Venezuela: "Venezuela",
  Argentina: "Argentina",
  Suramerica_General: "Suramérica General"
};

export default function RegionSelector({ unlockedRegions, bestScores, onSelectRegion }: RegionSelectorProps) {
  return (
    <div className="w-full space-y-3 pb-20">
      <h2 className="text-xl font-bold mb-4 px-2">Selecciona una Región</h2>
      {REGIONS_ORDER.map((region, index) => {
        const isUnlocked = unlockedRegions.includes(region);
        const bestScore = bestScores[region];

        return (
          <motion.button
            key={region}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            disabled={!isUnlocked}
            onClick={() => onSelectRegion(region)}
            className={`w-full glass-card p-4 flex items-center justify-between transition-all active:scale-[0.98] ${
              isUnlocked ? "hover:bg-white/5 cursor-pointer" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isUnlocked ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-white/5 text-white/30"
              }`}>
                {isUnlocked ? (bestScore >= 90 ? <CheckCircle2 size={20} /> : index + 1) : <Lock size={18} />}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">{REGION_NAMES[region]}</h3>
                <p className="text-xs opacity-60">
                  {isUnlocked ? `Mejor precisión: ${bestScore}%` : "Bloqueado"}
                </p>
              </div>
            </div>
            {isUnlocked && <ChevronRight className="opacity-40" />}
          </motion.button>
        );
      })}
    </div>
  );
}
