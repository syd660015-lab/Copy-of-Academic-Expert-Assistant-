
import React, { useState, useEffect, useMemo } from 'react';
import { SYLLABUS } from '../constants';
import { TermTooltip } from './TermTooltip';
import { 
  Book, CheckCircle2, Brain, Network, Zap, Users, 
  EyeOff, Puzzle, Heart, Ruler, Palette, Activity,
  Info, Target, Shield, Circle, GraduationCap
} from 'lucide-react';

const STORAGE_KEY = 'ashour_academic_completed_lectures';

const getLectureIcon = (id: number) => {
  switch (id) {
    case 1: return Brain;
    case 2: return Network;
    case 3: return Zap;
    case 4: return Users;
    case 5: return EyeOff;
    case 6: return Puzzle;
    case 7: return Heart;
    case 8: return Ruler;
    case 9: return Palette;
    case 10: return Activity;
    case 11: return Shield;
    default: return Book;
  }
};

export const LecturesView: React.FC = () => {
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const allTerms = useMemo(() => {
    return SYLLABUS.flatMap(l => l.glossary).sort((a, b) => b.term.length - a.term.length);
  }, []);

  // Load completion status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load completion status", e);
      }
    }
  }, []);

  // Save completion status whenever it changes
  const toggleCompletion = (id: number) => {
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(cid => cid !== id)
      : [...completedIds, id];
    
    setCompletedIds(newCompleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
  };

  const highlightTerms = (text: string) => {
    if (!text) return text;
    
    // Create a regex from all terms
    const termNames = allTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${termNames.join('|')})`, 'g');
    
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const termInfo = allTerms.find(t => t.term === part);
      if (termInfo) {
        return (
          <TermTooltip 
            key={i} 
            term={termInfo.term} 
            termEn={termInfo.termEn} 
            definition={termInfo.definition}
          >
            {part}
          </TermTooltip>
        );
      }
      return part;
    });
  };

  const progressPercentage = Math.round((completedIds.length / SYLLABUS.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 academic-font">مخطط المحاضرات الأكاديمية</h2>
        <div className="w-24 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
        
        {/* Progress Summary Section */}
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-indigo-600" size={20} />
              <span className="text-sm font-bold text-slate-700">تقدمك الدراسي</span>
            </div>
            <span className="text-indigo-600 font-black text-lg">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">
            تم إنجاز {completedIds.length} من أصل {SYLLABUS.length} محاضرة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
        {SYLLABUS.map((lecture) => {
          const IconComponent = getLectureIcon(lecture.id);
          const isCompleted = completedIds.includes(lecture.id);
          
          return (
            <div 
              key={lecture.id} 
              className={`relative bg-white rounded-3xl shadow-lg border-t-8 transition-all duration-500 ease-out group overflow-hidden hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.015] ${
                isCompleted ? 'border-green-500' : 'border-indigo-600'
              }`}
            >
              {/* Parallax Background Icon */}
              <div className="absolute -top-10 -left-10 opacity-[0.02] group-hover:opacity-[0.08] group-hover:translate-x-12 group-hover:-translate-y-12 group-hover:rotate-[45deg] transition-all duration-1000 ease-in-out pointer-events-none transform-gpu">
                <IconComponent size={240} />
              </div>

              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out ${
                      isCompleted ? 'bg-green-600 text-white' : 'bg-indigo-900 text-white'
                    }`}>
                      <IconComponent size={32} />
                    </div>
                    <div>
                      <span className={`${isCompleted ? 'text-green-600' : 'text-indigo-600'} font-bold text-xs block mb-1 tracking-widest uppercase`}>
                        المحاضرة {lecture.id}
                        {isCompleted && ' • تم الإنجاز'}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 academic-font group-hover:text-indigo-900 transition-colors duration-300">{lecture.title}</h3>
                    </div>
                  </div>
                  
                  {/* Completion Toggle */}
                  <button 
                    onClick={() => toggleCompletion(lecture.id)}
                    className={`p-2 rounded-xl transition-all active:scale-90 flex items-center gap-2 text-xs font-bold ${
                      isCompleted 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    <span className="hidden sm:inline">{isCompleted ? 'مكتملة' : 'تحديد كمكتملة'}</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <p className="text-slate-700 leading-relaxed font-medium text-lg">
                      {highlightTerms(lecture.description)}
                    </p>
                  </div>

                  {/* Title Explanation Box */}
                  <div className="bg-slate-50 border-r-4 border-indigo-400 p-5 rounded-2xl group-hover:bg-indigo-50/50 group-hover:border-indigo-600 transition-all duration-500">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold mb-2 text-sm">
                      <Info size={16} />
                      <span>سياق المفهوم:</span>
                    </div>
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      {highlightTerms(lecture.titleExplanation)}
                    </p>
                  </div>

                  {/* Learning Goals */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <Target size={18} className="text-indigo-600" />
                      <span>المستهدف من المحاضرة:</span>
                    </div>
                    <ul className="grid grid-cols-1 gap-3">
                      {lecture.goals.map((goal, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-start gap-3 text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-xl group-hover:border-indigo-200 group-hover:shadow-sm transition-all duration-300 transform group-hover:translate-x-1"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{highlightTerms(goal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                    {lecture.keyConcepts.map((concept, idx) => (
                      <span 
                        key={idx} 
                        className="flex items-center gap-1 text-[10px] uppercase font-black text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300"
                      >
                        {highlightTerms(concept)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative base banner */}
              <div className={`p-3 text-center border-t border-slate-100 transition-all duration-500 ${
                isCompleted ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-900 group-hover:text-white'
              }`}>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60 group-hover:opacity-100">Arish University • Faculty of Arts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
