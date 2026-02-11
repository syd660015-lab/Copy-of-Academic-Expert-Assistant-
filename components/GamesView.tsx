
import React, { useState, useEffect, useMemo } from 'react';
import { SYLLABUS } from '../constants';
import { 
  Trophy, RefreshCw, Star, Zap, ChevronRight, CheckCircle2, 
  XCircle, Timer, Puzzle, HelpCircle, Layers, SortAsc,
  Dices, BrainCircuit, GraduationCap
} from 'lucide-react';

type GameMode = 'matching' | 'truefalse' | 'sorting' | 'sequencing' | 'scramble';

interface GameItem {
  id: string;
  text: string;
  matchId: string;
  type: 'term' | 'definition';
}

interface TFQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

interface SortableItem {
  id: number;
  text: string;
  order: number;
}

export const GamesView: React.FC = () => {
  const [selectedLecture, setSelectedLecture] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  
  // Matching Game State
  const [matchItems, setMatchItems] = useState<GameItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  // True/False Game State
  const [tfQuestions, setTfQuestions] = useState<TFQuestion[]>([]);
  const [tfIndex, setTfIndex] = useState(0);
  const [tfFeedback, setTfFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Sorting Game State (Freudian Specific)
  const [sortItems, setSortItems] = useState<{id: number, text: string, category: string}[]>([]);
  
  // Sequencing Game State (Maslow's Hierarchy)
  const [sequenceItems, setSequenceItems] = useState<SortableItem[]>([]);
  const [userSequence, setUserSequence] = useState<SortableItem[]>([]);

  // Word Scramble State
  const [scrambleTerm, setScrambleTerm] = useState<{original: string, scrambled: string, hint: string} | null>(null);
  const [scrambleInput, setScrambleInput] = useState('');

  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initMatching = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture) return;
    const gameTerms = lecture.glossary.slice(0, 6);
    const terms: GameItem[] = gameTerms.map(t => ({ id: `term-${t.term}`, text: t.term, matchId: t.termEn, type: 'term' }));
    const definitions: GameItem[] = gameTerms.map(t => ({ id: `def-${t.termEn}`, text: t.termEn, matchId: t.termEn, type: 'definition' }));
    const combined = [...terms, ...definitions].sort(() => Math.random() - 0.5);
    setMatchItems(combined);
    setMatchedIds([]);
    setSelectedMatchId(null);
  };

  const initTrueFalse = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture) return;
    const questions: TFQuestion[] = lecture.glossary.map(t => ({
      statement: `${t.term} يعني: ${t.definition.substring(0, 40)}...`,
      isTrue: Math.random() > 0.3,
      explanation: t.definition
    }));
    setTfQuestions(questions.sort(() => Math.random() - 0.5));
    setTfIndex(0);
    setTimeLeft(10);
    setTfFeedback(null);
  };

  const initSorting = () => {
    const items = [
      { id: 1, text: "طلب الإشباع الفوري للرغبات والغرائز", category: "الهو" },
      { id: 2, text: "العمل وفق مبدأ الواقع وتنسيق الشخصية", category: "الأنا" },
      { id: 3, text: "مستودع الضمير والقيم الأخلاقية العليا", category: "الأنا الأعلى" },
      { id: 4, text: "يوجد في الجانب الفطري والبدائي من النفس", category: "الهو" },
      { id: 5, text: "يحاول الموازنة بين ضغوط الواقع والغرائز", category: "الأنا" },
      { id: 6, text: "يمثل الرقيب الداخلي والمثالية الاجتماعية", category: "الأنا الأعلى" }
    ].sort(() => Math.random() - 0.5);
    setSortItems(items);
  };

  const initSequencing = () => {
    const maslowLevels = [
      { id: 1, text: "الحاجات الفسيولوجية (قاعدة الهرم)", order: 1 },
      { id: 2, text: "حاجات الأمن والأمان", order: 2 },
      { id: 3, text: "الحب والانتماء", order: 3 },
      { id: 4, text: "تقدير الذات", order: 4 },
      { id: 5, text: "تحقيق الذات (قمة الهرم)", order: 5 }
    ];
    setSequenceItems([...maslowLevels].sort(() => Math.random() - 0.5));
    setUserSequence([]);
  };

  const initScramble = (lectureId: number) => {
    const lecture = SYLLABUS.find(l => l.id === lectureId);
    if (!lecture || lecture.glossary.length === 0) return;
    const target = lecture.glossary[Math.floor(Math.random() * lecture.glossary.length)];
    
    // Simple scramble logic
    const scramble = (str: string) => str.split('').sort(() => Math.random() - 0.5).join('');
    
    setScrambleTerm({
      original: target.term,
      scrambled: scramble(target.term),
      hint: target.definition.substring(0, 50) + "..."
    });
    setScrambleInput('');
  };

  const startGame = (mode: GameMode, lectureId: number) => {
    setActiveMode(mode);
    setSelectedLecture(lectureId);
    setScore(0);
    setIsWon(false);

    if (mode === 'matching') initMatching(lectureId);
    if (mode === 'truefalse') initTrueFalse(lectureId);
    if (mode === 'sorting') initSorting();
    if (mode === 'sequencing') initSequencing();
    if (mode === 'scramble') initScramble(lectureId);
  };

  // Timer Effect for True/False
  useEffect(() => {
    let timer: number;
    if (activeMode === 'truefalse' && !isWon && timeLeft > 0 && !tfFeedback) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeMode === 'truefalse') {
      handleTFAnswer(false);
    }
    return () => clearInterval(timer);
  }, [activeMode, timeLeft, isWon, tfFeedback]);

  const handleTFAnswer = (ans: boolean) => {
    if (tfFeedback) return;
    const correct = tfQuestions[tfIndex].isTrue === ans;
    setTfFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(prev => prev + 20);

    setTimeout(() => {
      if (tfIndex < tfQuestions.length - 1) {
        setTfIndex(prev => prev + 1);
        setTfFeedback(null);
        setTimeLeft(10);
      } else {
        setIsWon(true);
      }
    }, 1500);
  };

  const handleMatchClick = (item: GameItem) => {
    if (matchedIds.includes(item.id)) return;
    if (selectedMatchId === null) {
      setSelectedMatchId(item.id);
      return;
    }
    const firstItem = matchItems.find(i => i.id === selectedMatchId);
    if (!firstItem || firstItem.id === item.id) {
      setSelectedMatchId(null);
      return;
    }

    if (firstItem.type !== item.type && firstItem.matchId === item.matchId) {
      const newMatched = [...matchedIds, firstItem.id, item.id];
      setMatchedIds(newMatched);
      setSelectedMatchId(null);
      setScore(prev => prev + 15);
      if (newMatched.length === matchItems.length) setIsWon(true);
    } else {
      setSelectedMatchId(item.id);
    }
  };

  const handleSort = (item: any, category: string) => {
    if (item.category === category) {
      setScore(prev => prev + 10);
      setSortItems(prev => prev.filter(i => i.id !== item.id));
      if (sortItems.length === 1) setIsWon(true);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const handleSequenceClick = (item: SortableItem) => {
    const expectedOrder = userSequence.length + 1;
    if (item.order === expectedOrder) {
      setScore(prev => prev + 25);
      setUserSequence([...userSequence, item]);
      setSequenceItems(sequenceItems.filter(i => i.id !== item.id));
      if (sequenceItems.length === 1) setIsWon(true);
    } else {
      setScore(prev => Math.max(0, prev - 10));
    }
  };

  const handleScrambleSubmit = () => {
    if (scrambleInput.trim() === scrambleTerm?.original) {
      setScore(prev => prev + 50);
      setIsWon(true);
    } else {
      setScore(prev => Math.max(0, prev - 15));
      setScrambleInput('');
    }
  };

  if (!selectedLecture || !activeMode) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-slate-800 academic-font">مركز الألعاب الأكاديمية</h2>
          <div className="w-32 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto font-medium">
            تحدَّ ذكاءك وعزز ذاكرتك الأكاديمية من خلال مجموعة متنوعة من الألعاب التفاعلية المستوحاة من منهج د. أحمد الغول.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SYLLABUS.map((lecture) => (
            <div key={lecture.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border-b-8 border-b-indigo-100 hover:border-b-indigo-600">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                  {lecture.id}
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{lecture.title}</h3>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => startGame('matching', lecture.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-sm font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Puzzle size={18} /> تحدي التوصيل
                  </div>
                  <ChevronRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>
                
                <button 
                  onClick={() => startGame('truefalse', lecture.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-green-600 hover:text-white rounded-2xl transition-all text-sm font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} /> ماراثون صح أم خطأ
                  </div>
                  <ChevronRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>

                <button 
                  onClick={() => startGame('scramble', lecture.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-600 hover:text-white rounded-2xl transition-all text-sm font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Dices size={18} /> لغز الكلمات المبعثرة
                  </div>
                  <ChevronRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
                </button>

                {lecture.id === 1 && (
                  <button 
                    onClick={() => startGame('sorting', lecture.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-600 hover:text-white rounded-2xl transition-all text-sm font-bold group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Layers size={18} /> تصنيف أجهزة النفس
                    </div>
                    <ChevronRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
                  </button>
                )}

                {lecture.id === 4 && (
                  <button 
                    onClick={() => startGame('sequencing', lecture.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all text-sm font-bold group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <SortAsc size={18} /> ترتيب هرم ماسلو
                    </div>
                    <ChevronRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-5 duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedLecture(null); setActiveMode(null); }} 
            className="p-3 bg-slate-100 hover:bg-indigo-900 hover:text-white rounded-2xl transition-all"
            title="العودة للقائمة"
          >
            <ChevronRight className="rotate-0" size={24} />
          </button>
          <div>
            <h3 className="font-black text-slate-800 academic-font text-xl">
              {activeMode === 'matching' && "تحدي التوصيل الذهني"}
              {activeMode === 'truefalse' && "ماراثون صح أم خطأ"}
              {activeMode === 'sorting' && "تحدي فرز المفاهيم"}
              {activeMode === 'sequencing' && "بناء هرم الاحتياجات"}
              {activeMode === 'scramble' && "فك شفرة المصطلح"}
            </h3>
            <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-0.5">المحاضرة: {SYLLABUS.find(l => l.id === selectedLecture)?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-yellow-50 px-5 py-2 rounded-2xl border border-yellow-200">
            <Star className="text-yellow-500 fill-yellow-500" size={22} />
            <span className="font-black text-2xl text-yellow-700">{score}</span>
          </div>
          {activeMode === 'truefalse' && !isWon && (
            <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border ${timeLeft < 4 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
              <Timer size={22} className={timeLeft < 4 ? 'animate-pulse' : ''} />
              <span className="font-black text-xl">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {isWon ? (
        <div className="bg-white p-16 rounded-[3rem] shadow-2xl text-center border-8 border-indigo-50 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl ring-8 ring-yellow-50">
            <Trophy size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 academic-font">انتصار أكاديمي مستحق!</h2>
          <p className="text-xl text-slate-500 mb-10 italic max-w-lg mx-auto">
            لقد أثبتَّ تمكناً عالياً من المادة العلمية. استمر في هذا الحماس لتصل لأعلى درجات التفوق.
          </p>
          <div className="flex justify-center gap-6">
            <button 
              onClick={() => { setSelectedLecture(null); setActiveMode(null); }} 
              className="px-10 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95"
            >
              العودة للمنصة
            </button>
            <button 
              onClick={() => startGame(activeMode, selectedLecture)} 
              className="px-10 py-4 bg-indigo-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              تحدي جديد
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[500px] animate-in fade-in duration-500">
          {/* Matching Game UI */}
          {activeMode === 'matching' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {matchItems.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedMatchId === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item)}
                    className={`h-36 p-6 rounded-3xl flex items-center justify-center text-center transition-all border-4 shadow-sm ${
                      isMatched ? 'bg-green-50 border-green-200 text-green-700 opacity-60 scale-95 shadow-none' :
                      isSelected ? 'bg-indigo-900 border-indigo-900 text-white scale-105 shadow-2xl ring-4 ring-indigo-100' :
                      'bg-white border-white text-slate-700 hover:border-indigo-400 hover:shadow-lg'
                    }`}
                  >
                    <span className={`font-bold ${item.type === 'definition' ? 'text-sm uppercase font-sans tracking-tighter' : 'text-lg academic-font'}`}>{item.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False Game UI */}
          {activeMode === 'truefalse' && (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
               <div className="w-full bg-slate-100 h-3 rounded-full mb-12">
                 <div className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out" style={{width: `${((tfIndex + 1) / tfQuestions.length) * 100}%`}}></div>
               </div>
               <div className={`mb-12 p-12 text-center rounded-3xl transition-all duration-300 w-full min-h-[200px] flex items-center justify-center ${
                 tfFeedback === 'correct' ? 'bg-green-50 text-green-700 ring-2 ring-green-100' : 
                 tfFeedback === 'wrong' ? 'bg-red-50 text-red-700 ring-2 ring-red-100' : 'bg-slate-50'
               }`}>
                 <h4 className="text-3xl font-black academic-font leading-relaxed">{tfQuestions[tfIndex].statement}</h4>
               </div>
               <div className="flex gap-8 w-full max-w-lg">
                 <button onClick={() => handleTFAnswer(true)} className="flex-1 bg-green-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center justify-center gap-3">
                   <CheckCircle2 size={32} /> صح
                 </button>
                 <button onClick={() => handleTFAnswer(false)} className="flex-1 bg-red-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95 flex items-center justify-center gap-3">
                   <XCircle size={32} /> خطأ
                 </button>
               </div>
               {tfFeedback && (
                 <div className="mt-10 text-center animate-in fade-in slide-in-from-top-4 duration-500 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-xl">
                   <p className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-2">التفسير العلمي:</p>
                   <p className="text-slate-600 italic leading-relaxed">{tfQuestions[tfIndex].explanation}</p>
                 </div>
               )}
            </div>
          )}

          {/* Sorting Game UI */}
          {activeMode === 'sorting' && (
            <div className="space-y-12">
              <div className="flex flex-wrap justify-center gap-6">
                {sortItems.length > 0 ? (
                  <div className="p-12 bg-white border-4 border-dashed border-indigo-200 rounded-[3rem] w-full text-center shadow-lg transform-gpu animate-in zoom-in duration-300">
                    <div className="bg-indigo-900 text-white px-6 py-2 rounded-full w-fit mx-auto mb-6 text-sm font-black uppercase tracking-widest">المفهوم المستهدف</div>
                    <h4 className="text-4xl font-black text-slate-800 academic-font leading-relaxed">{sortItems[0].text}</h4>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {["الهو", "الأنا", "الأنا الأعلى"].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => sortItems.length > 0 && handleSort(sortItems[0], cat)}
                    className="p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-indigo-600 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-5 shadow-sm hover:shadow-2xl"
                  >
                    <div className="p-5 bg-slate-50 group-hover:bg-indigo-900 rounded-3xl text-slate-400 group-hover:text-white transition-all transform group-hover:rotate-12">
                      <Layers size={48} />
                    </div>
                    <span className="text-2xl font-black text-slate-800 academic-font">{cat}</span>
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest opacity-60">انقر للتصنيف</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sequencing Game UI */}
          {activeMode === 'sequencing' && (
            <div className="space-y-10">
              <div className="flex flex-col gap-4">
                <h4 className="text-center font-black text-indigo-900 text-lg uppercase tracking-widest mb-4">هرم ماسلو المبني (الترتيب الصحيح)</h4>
                <div className="flex flex-col-reverse gap-3 max-w-xl mx-auto w-full">
                  {[1, 2, 3, 4, 5].map(lvl => {
                    const matched = userSequence.find(i => i.order === lvl);
                    return (
                      <div 
                        key={lvl}
                        className={`p-5 rounded-2xl border-2 text-center font-bold transition-all h-16 flex items-center justify-center ${
                          matched ? 'bg-green-600 text-white border-green-700 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-300 border-dashed'
                        }`}
                        style={{ width: `${60 + (lvl * 8)}%`, margin: '0 auto' }}
                      >
                        {matched ? matched.text : `المستوى ${lvl}`}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100">
                <h4 className="text-center text-slate-500 font-bold mb-6">اختر المستوى التالي بالترتيب الصحيح:</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {sequenceItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSequenceClick(item)}
                      className="p-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-xl transition-all font-bold text-slate-700 active:scale-95"
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scramble Game UI */}
          {activeMode === 'scramble' && scrambleTerm && (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl text-purple-700 border border-purple-100 mb-6">
                  <BrainCircuit size={18} />
                  <span className="text-sm font-black uppercase">لغز الذاكرة الأكاديمية</span>
                </div>
                <h4 className="text-5xl font-black text-slate-800 tracking-[0.2em] mb-8 bg-slate-50 p-10 rounded-3xl border-2 border-slate-100">
                  {scrambleTerm.scrambled}
                </h4>
                <div className="max-w-xl bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-right">
                  <p className="text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">تلميح أكاديمي:</p>
                  <p className="text-slate-600 italic leading-relaxed">{scrambleTerm.hint}</p>
                </div>
              </div>

              <div className="w-full max-w-md flex flex-col gap-6">
                <input
                  type="text"
                  value={scrambleInput}
                  onChange={(e) => setScrambleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScrambleSubmit()}
                  placeholder="اكتب المصطلح الصحيح هنا..."
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 text-center text-2xl font-black academic-font"
                />
                <button 
                  onClick={handleScrambleSubmit}
                  className="w-full bg-indigo-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Zap size={24} /> تحقق من الحل
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
