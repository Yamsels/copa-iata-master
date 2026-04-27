"use client";

import React from "react";
import { Trophy, Target, Award } from "lucide-react";
import { getRank } from "@/lib/game-logic";

interface DashboardProps {
  points: number;
  masteredCount: number;
  totalCount: number;
}

export default function Dashboard({ points, masteredCount, totalCount }: DashboardProps) {
  const progressPercent = Math.round((masteredCount / totalCount) * 100);
  const rank = getRank(masteredCount, totalCount);

  return (
    <div className="w-full grid grid-cols-2 gap-3 mb-6">
      <div className="glass-card p-4 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="text-[var(--primary)] w-4 h-4" />
          <span className="text-xs uppercase tracking-wider opacity-60">Puntos</span>
        </div>
        <span className="text-2xl font-bold">{points.toLocaleString()}</span>
      </div>

      <div className="glass-card p-4 flex flex-col items-center justify-center col-span-2 sm:col-span-1">
        <div className="flex items-center gap-2 mb-1">
          <Award className="text-[var(--primary)] w-4 h-4" />
          <span className="text-xs uppercase tracking-wider opacity-60">Rango</span>
        </div>
        <span className="text-xl font-bold text-[var(--primary)]">{rank.name}</span>
      </div>

      <div className="glass-card p-4 col-span-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Target className="text-[var(--primary)] w-4 h-4" />
            <span className="text-xs uppercase tracking-wider opacity-60">Dominio de Red</span>
          </div>
          <span className="text-sm font-bold">{masteredCount} / {totalCount} ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary)] transition-all duration-1000 ease-out shadow-[0_0_10px_var(--primary)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
