
import React, { useState, useEffect } from 'react';
import { SYLLABUS } from '../constants';
import { TermTooltip } from './TermTooltip';
import { Search, BookMarked, Filter, Plus, X, Trash2, Info, HelpCircle } from 'lucide-react';

interface CustomTerm {
  id: string;
  term: string;
  termEn: string;
  definition: string;
  lectureTitle: string;
  lectureId: number | string;
  isCustom: boolean;
}

export const GlossaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLecture, setSelectedLecture] = useState<number | 'all' | 'custom'>('all');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [customTerms, setCustomTerms] = useState<CustomTerm[]>([]);

  // New term form state
  const [newTerm, setNewTerm] = useState('');
  const [newTermEn, setNewTermEn] = useState('');
  const [newDefinition, setNewDefinition] = useState('');

  // Load custom terms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('academic_custom_terms');
    if (saved) {
      try {
        setCustomTerms(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom terms", e);
      }
    }
  }, []);

  // Save custom terms to localStorage
  useEffect(() => {
    localStorage.setItem('academic_custom_terms', JSON.stringify(customTerms));
  }, [customTerms]);

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;

    const term: CustomTerm = {
      id: Date.now().toString(),
      term: newTerm,
      termEn: newTermEn,
      definition: newDefinition,
      lectureTitle: 'مصطلح مضاف من الطالب',
      lectureId: 'custom',
      isCustom: true
    };

    setCustomTerms([term, ...customTerms]);
    setNewTerm('');
    setNewTermEn('');
    setNewDefinition('');
    setIsAddFormOpen(false);
  };

  const handleDeleteCustomTerm = (id: string) => {
    setCustomTerms(customTerms.filter(t => t.id !== id));
  };

  const syllabusTerms = SYLLABUS.flatMap(l => 
    l.glossary.map(t => ({ 
      ...t, 
      id: `syllabus-${l.id}-${t.term}`, 
      lectureTitle: l.title, 
      lectureId: l.id,
      isCustom: false
    }))
  );

  const allTerms = [...customTerms, ...syllabusTerms];

  const filteredTerms = allTerms.filter(t => {
    const matchesSearch = t.term.includes(searchTerm) || t.termEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLecture = selectedLecture === 'all' || 
                           (selectedLecture === 'custom' && t.isCustom) ||
                           t.lectureId === selectedLecture;
    return matchesSearch && matchesLecture;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 academic-font">قاموس المصطلحات الأكاديمية</h2>
        <div className="w-24 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
          دليلك الشامل للمفاهيم الأساسية في علم النفس الدينامي ونظريات القياس. مرر الماوس فوق أي مصطلح لعرض تعريفه السريع.
        </p>
      </div>

      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن مصطلح (بالعربية أو الإنجليزية)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedLecture}
                onChange={(e) => setSelectedLecture(e.target.value === 'all' ? 'all' : (e.target.value === 'custom' ? 'custom' : Number(e.target.value)))}
                className="bg-transparent focus:outline-none text-xs font-bold text-slate-600"
              >
                <option value="all">كل المحاضرات</option>
                <option value="custom">المصطلحات المضافة</option>
                {SYLLABUS.map(l => (
                  <option key={l.id} value={l.id}>المحاضرة {l.id}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all text-sm ${
                isAddFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
              }`}
            >
              {isAddFormOpen ? <X size={18} /> : <Plus size={18} />}
              <span className="hidden sm:inline">{isAddFormOpen ? 'إلغاء' : 'إضافة مصطلح'}</span>
            </button>
          </div>
        </div>

        {isAddFormOpen && (
          <form onSubmit={handleAddTerm} className="mt-4 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-900 block px-1">المصطلح (بالعربية) *</label>
                <input
                  required
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="مثال: الشعور بالنقص"
                  className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-900 block px-1">English Term</label>
                <input
                  type="text"
                  value={newTermEn}
                  onChange={(e) => setNewTermEn(e.target.value)}
                  placeholder="e.g. Inferiority Feeling"
                  className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans"
                />
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-indigo-900 block px-1">التعريف الأكاديمي *</label>
              <textarea
                required
                rows={3}
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="اكتب هنا شرحاً موجزاً ودقيقاً للمصطلح..."
                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-800 transition-colors shadow-md"
            >
              حفظ المصطلح في القاموس الشخصي
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col ${
                item.isCustom ? 'border-indigo-400' : 'border-slate-100 border-r-4 border-r-indigo-200 hover:border-r-indigo-600'
              }`}
            >
              {item.isCustom && (
                <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-br-xl tracking-tighter shadow-sm z-10">
                  Custom Entry
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <TermTooltip term={item.term} termEn={item.termEn} definition={item.definition}>
                    <div className="cursor-help flex items-center gap-2 group/title">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-900 transition-colors academic-font">
                        {item.term}
                      </h3>
                    </div>
                  </TermTooltip>
                  {item.termEn && (
                    <TermTooltip term={item.term} termEn={item.termEn} definition={item.definition}>
                      <span className="text-xs font-bold text-indigo-500 font-sans tracking-wide uppercase mt-1 cursor-help hover:text-indigo-700 transition-colors">
                        {item.termEn}
                      </span>
                    </TermTooltip>
                  )}
                </div>
                <div className="flex gap-2">
                  {item.isCustom ? (
                    <button 
                      onClick={() => handleDeleteCustomTerm(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="حذف المصطلح"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <BookMarked size={20} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {item.definition}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                <div className="flex items-center gap-1.5">
                  {item.isCustom ? (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                      <Info size={10} /> ملاحظة شخصية
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase tracking-tighter">
                      المحاضرة {item.lectureId}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 italic max-w-[150px] truncate text-left">
                  {item.lectureTitle}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="inline-block p-6 bg-slate-50 rounded-full mb-4">
              <Search size={40} className="text-slate-300" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">لا يوجد نتائج</h4>
            <p className="text-slate-500 text-sm">عذراً، لم نجد أي مصطلح يطابق بحثك الحالي.</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
