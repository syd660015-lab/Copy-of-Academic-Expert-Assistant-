
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message } from '../types';
import { SYLLABUS } from '../constants';
import { generateGeminiResponse } from '../services/geminiService';
import { TermTooltip } from './TermTooltip';
import { Send, User, Bot, Loader2, Info, CheckCircle2, Eye, EyeOff, BookOpenCheck, Volume2, VolumeX } from 'lucide-react';

// --- Sound Effects Utility ---
const playSound = (type: 'send' | 'receive' | 'reveal') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'reveal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

interface MCQItemProps {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  soundEnabled: boolean;
}

const MCQItem: React.FC<MCQItemProps> = ({ question, options, answer, explanation, soundEnabled }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleAnswer = () => {
    const nextState = !showAnswer;
    setShowAnswer(nextState);
    if (nextState && soundEnabled) {
      playSound('reveal');
    }
  };

  return (
    <div className="my-4 bg-white border border-indigo-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-700">تقييم سريع</span>
        <button 
          onClick={toggleAnswer}
          className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 text-xs font-medium"
        >
          {showAnswer ? <><EyeOff size={14} /> إخفاء الإجابة</> : <><Eye size={14} /> إظهار الإجابة</>}
        </button>
      </div>
      <div className="p-4">
        <p className="font-bold text-slate-800 mb-3">{question}</p>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full text-xs font-bold text-indigo-600">
                {String.fromCharCode(1571 + idx)}
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
        {showAnswer && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={18} />
              <p className="text-sm font-bold text-green-800">الإجابة الصحيحة: {answer}</p>
            </div>
            {explanation && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3">
                <BookOpenCheck className="text-indigo-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm">
                  <span className="font-bold text-indigo-900 block mb-1">الشرح الأكاديمي:</span>
                  <p className="text-slate-700 leading-relaxed italic">{explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'أهلاً بك يا زميلي الطالب في رحاب علم النفس الدينامي والقياس النفسي. أنا هنا لمساعدتك في فهم منهج دكتور. أحمد حمدي عاشور الغول. كيف يمكنني إفادتك اليوم؟ (مثلاً: اشرح لي الفرق بين الصدق والثبات، أو حدثني عن عقدة أوديب).'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  const allTerms = useMemo(() => {
    return SYLLABUS.flatMap(l => l.glossary).sort((a, b) => b.term.length - a.term.length);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // Play receive sound when a new assistant message arrives
    if (messages.length > prevMessagesLength.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && soundEnabled) {
        playSound('receive');
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages, soundEnabled]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (soundEnabled) playSound('send');

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = [...messages, userMsg];
    const response = await generateGeminiResponse(history);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
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

  const renderContent = (content: string, role: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      const qMatch = line.match(/^(\*\*)?س(\d+): (.+?)(\*\*)?$/);
      if (qMatch) {
        const question = qMatch[3];
        const options: string[] = [];
        let answer = '';
        let explanation = '';
        
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          const optMatch = nextLine.match(/^([أبجده])\) (.+)/);
          const ansMatch = nextLine.match(/^(\*)?الإجابة الصحيحة: (.+?)(\*)?$/);
          const expMatch = nextLine.match(/^(الشرح الأكاديمي|التفسير): (.+)/);
          
          if (optMatch) {
            options.push(optMatch[2]);
            j++;
          } else if (ansMatch) {
            answer = ansMatch[2];
            j++;
          } else if (expMatch) {
            explanation = expMatch[2];
            j++;
            break; 
          } else if (nextLine === '' && explanation === '') {
            j++;
          } else if (nextLine === '' && explanation !== '') {
            break;
          } else {
            if (answer !== '') break; 
            j++;
          }
        }
        
        if (options.length > 0) {
          elements.push(<MCQItem key={`mcq-${i}`} question={question} options={options} answer={answer} explanation={explanation} soundEnabled={soundEnabled} />);
          i = j;
          continue;
        }
      }

      if (line === '') {
        elements.push(<div key={i} className="h-2"></div>);
      } else if (line.startsWith('**')) {
        elements.push(<p key={i} className="font-bold text-indigo-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>);
      } else if (line.startsWith('- ')) {
        elements.push(<li key={i} className="mr-6 list-disc text-slate-700 my-1">{role === 'assistant' ? highlightTerms(line.substring(2)) : line.substring(2)}</li>);
      } else {
        elements.push(<p key={i} className="mb-2 text-slate-700 leading-relaxed academic-font text-lg">{role === 'assistant' ? highlightTerms(line) : line}</p>);
      }
      i++;
    }
    
    return elements;
  };

  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
      <div className="bg-indigo-900 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 text-white font-semibold">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Bot size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm">المساعد الأكاديمي النشط</span>
            <span className="text-[10px] text-indigo-300 font-normal">جاهز لاستفساراتك الأكاديمية</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-white/10 text-indigo-100 transition-colors"
            title={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-indigo-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <Info size={14} />
            <span>الذكاء الاصطناعي يدعم التعلم</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start flex-row-reverse' : 'justify-start'} gap-4 animate-in fade-in duration-300`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-900'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {renderContent(msg.content, msg.role)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Loader2 className="animate-spin text-indigo-900" size={20} />
            </div>
            <div className="bg-white border border-slate-100 text-slate-500 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
              <span className="text-sm italic academic-font">جاري تحليل السياق واستحضار المادة العلمية...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 max-w-4xl mx-auto items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اسأل عن أي مفهوم في علم النفس الدينامي أو القياس..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[50px] max-h-[150px]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-900 text-white p-3.5 rounded-2xl hover:bg-indigo-800 transition-all shadow-lg disabled:bg-slate-300 disabled:shadow-none active:scale-95 flex-shrink-0"
          >
            <Send size={22} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
