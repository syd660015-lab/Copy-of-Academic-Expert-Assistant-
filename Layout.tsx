
import React from 'react';
import { AppView } from '../types';
import { BookOpen, MessageSquare, BarChart3, GraduationCap, ClipboardCheck, Languages, Gamepad2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const navItems = [
    { id: AppView.CHAT, icon: MessageSquare, label: 'المساعد الذكي' },
    { id: AppView.LECTURES, icon: BookOpen, label: 'المحاضرات' },
    { id: AppView.QUIZ, icon: ClipboardCheck, label: 'بنك الأسئلة' },
    { id: AppView.GLOSSARY, icon: Languages, label: 'القاموس' },
    { id: AppView.GAMES, icon: Gamepad2, label: 'تحدي المعرفة' },
    { id: AppView.MEASUREMENT, icon: BarChart3, label: 'أدوات القياس' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-arabic" dir="rtl">
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <GraduationCap className="text-indigo-900 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold academic-font">المساعد الأكاديمي الذكي</h1>
              <p className="text-xs md:text-sm text-indigo-200">دكتور. أحمد حمدي عاشور الغول. كلية الآداب بجامعة العريش</p>
            </div>
          </div>
          <nav className="flex gap-1 bg-indigo-800/50 p-1 rounded-xl overflow-x-auto max-w-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs md:text-sm whitespace-nowrap ${
                  activeView === item.id 
                    ? 'bg-white text-indigo-900 shadow-md' 
                    : 'text-indigo-100 hover:bg-indigo-700'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-slate-200 py-6 border-t border-slate-300">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} كلية الآداب بجامعة العريش
          </p>
          <p className="text-slate-500 text-xs mt-1">
            تحت إشراف دكتور. أحمد حمدي عاشور الغول
          </p>
        </div>
      </footer>
    </div>
  );
};
