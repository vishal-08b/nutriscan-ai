import React from 'react';
import { Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

export default function MacroRings({
  calories = 0,
  calorieGoal = 2000,
  protein = 0,
  proteinGoal = 140,
  carbs = 0,
  carbsGoal = 210,
  fat = 0,
  fatGoal = 65,
  size = 190
}) {
  const strokeWidth = 9;
  const gap = 3;

  // Radius for 3 concentric rings (Outer: Calories, Middle: Protein, Inner: Carbs/Fat)
  // Ring 1: Calories (Radius: 82)
  // Ring 2: Protein (Radius: 68)
  // Ring 3: Carbs (Radius: 54)
  // Ring 4: Fat (Radius: 40)
  const rings = [
    {
      id: 'cal',
      name: 'Calories',
      val: calories,
      goal: calorieGoal,
      radius: 82,
      color: '#10b981', // Emerald
      glow: 'rgba(16, 185, 129, 0.5)',
      unit: 'kcal'
    },
    {
      id: 'pro',
      name: 'Protein',
      val: protein,
      goal: proteinGoal,
      radius: 68,
      color: '#06b6d4', // Cyan
      glow: 'rgba(6, 182, 212, 0.5)',
      unit: 'g'
    },
    {
      id: 'carb',
      name: 'Carbs',
      val: carbs,
      goal: carbsGoal,
      radius: 54,
      color: '#f59e0b', // Amber
      glow: 'rgba(245, 158, 11, 0.5)',
      unit: 'g'
    },
    {
      id: 'fat',
      name: 'Fats',
      val: fat,
      goal: fatGoal,
      radius: 40,
      color: '#f43f5e', // Rose
      glow: 'rgba(244, 63, 94, 0.5)',
      unit: 'g'
    }
  ];

  const calPercent = Math.min(100, Math.round((calories / (calorieGoal || 1)) * 100));

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="transform -rotate-90 drop-shadow-xl"
        >
          {rings.map((ring) => {
            const circumference = 2 * Math.PI * ring.radius;
            const pct = Math.min(100, Math.max(0, (ring.val / (ring.goal || 1)) * 100));
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            return (
              <g key={ring.id}>
                {/* Background Track Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={ring.radius}
                  fill="transparent"
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeOpacity="0.15"
                />

                {/* Animated Progress Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={ring.radius}
                  fill="transparent"
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1s ease-in-out',
                    filter: `drop-shadow(0 0 4px ${ring.glow})`
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center Telemetry Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Flame className="w-4 h-4 text-emerald-400 mb-0.5 animate-pulse" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {calories}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            / {calorieGoal} kcal
          </span>
          <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5">
            {calPercent}%
          </span>
        </div>
      </div>

      {/* Ring Legends Strip */}
      <div className="grid grid-cols-4 gap-2 w-full mt-3 pt-2 border-t border-slate-800/80">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Cal</span>
          </div>
          <div className="text-[11px] font-bold text-slate-200 mt-0.5">{calPercent}%</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-[10px] text-cyan-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Pro</span>
          </div>
          <div className="text-[11px] font-bold text-slate-200 mt-0.5">{protein}g</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-[10px] text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Carb</span>
          </div>
          <div className="text-[11px] font-bold text-slate-200 mt-0.5">{carbs}g</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-[10px] text-rose-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Fat</span>
          </div>
          <div className="text-[11px] font-bold text-slate-200 mt-0.5">{fat}g</div>
        </div>
      </div>
    </div>
  );
}
