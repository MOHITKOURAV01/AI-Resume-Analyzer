import React, { useState } from 'react';
import type { ClassifiedSkill, SkillPriority } from '../utils/jdSkillParser';

interface SkillGapMatrixProps {
  extractedSkills: ClassifiedSkill[];
  candidateSkills: string[];
}

export const SkillGapMatrix: React.FC<SkillGapMatrixProps> = ({ extractedSkills, candidateSkills }) => {
  const [filterPriority, setFilterPriority] = useState<SkillPriority | 'ALL'>('ALL');

  // Fast hash lookup for matching candidate competencies
  const candidateSkillSet = new Set(candidateSkills.map(s => s.toLowerCase()));

  const filteredSkills = extractedSkills.filter(skill => {
    if (filterPriority === 'ALL') return true;
    return skill.priority === filterPriority;
  });

  // Calculate high-utility overview aggregate counts
  const missingRequiredCount = extractedSkills.filter(
    s => s.priority === 'REQUIRED' && !candidateSkillSet.has(s.name.toLowerCase())
  ).length;

  return (
    <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header Block & High-Priority Alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Skill Gap Priority Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">Skills are categorized automatically using job description context indicators.</p>
        </div>
        
        {missingRequiredCount > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-100 animate-pulse">
            <span>⚠️</span> Missing {missingRequiredCount} Critical Requirements
          </div>
        )}
      </div>

      {/* Segmented Filter Control Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg w-max text-xs font-medium">
        {(['ALL', 'REQUIRED', 'PREFERRED', 'STANDARD'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterPriority(type)}
            className={`rounded-md px-3 py-1.5 transition-colors capitalize ${
              filterPriority === type
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {type === 'ALL' ? 'All Skills' : type.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Interactive Priority Grid */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredSkills.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">No tracked skills match this category filter.</p>
        ) : (
          filteredSkills.map((skill) => {
            const isMatching = candidateSkillSet.has(skill.name.toLowerCase());
            
            return (
              <div 
                key={skill.name} 
                className={`flex items-start sm:items-center justify-between p-2.5 rounded-lg border transition-colors text-xs gap-4 ${
                  isMatching ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/30 border-rose-100'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 truncate">{skill.name}</span>
                    
                    {/* Visual Priority Badges */}
                    <span className={`inline-block scale-90 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                      skill.priority === 'REQUIRED' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                      skill.priority === 'PREFERRED' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {skill.priority === 'STANDARD' ? 'Equal Weight' : skill.priority.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 italic text-[11px] truncate max-w-xl" title={skill.contextPhrase}>
                    "{skill.contextPhrase}"
                  </p>
                </div>

                {/* Match Status Node */}
                <div className="shrink-0 flex items-center gap-1.5 font-semibold">
                  {isMatching ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">✓ Match</span>
                  ) : (
                    <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">✕ Missing</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
