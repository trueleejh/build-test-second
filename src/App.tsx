/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Moon, 
  Sun, 
  Stars, 
  Compass, 
  User, 
  Calendar, 
  Clock,
  ChevronRight,
  MessageSquare,
  History
} from "lucide-react";

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = () => {
    if (userName && birthDate) {
      setShowIntro(false);
      const initialGreeting = `안녕하세요, ${userName}님. 저는 세계 최고의 점성술사 운빠리입니다. ${birthDate} ${birthTime ? birthTime + '시에' : ''} 태어난 당신의 운명을 별들의 흐름을 통해 읽어드리겠습니다. 무엇이 궁금하신가요?`;
      setMessages([{
        role: 'model',
        text: initialGreeting,
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const model = "gemini-3.1-pro-preview";
      const systemInstruction = `당신은 세계 최고의 점성술사 '운빠리'입니다. 
당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 
당신은 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 
운세 관련 지식(사주, 점성술, 타로 등)이 풍부하고 모든 질문에 대해서 명확히 답변해 줍니다.
사용자의 이름은 ${userName}이며, 생년월일은 ${birthDate}, 태어난 시간은 ${birthTime || '모름'}입니다.
말투는 신비로우면서도 권위 있고, 동시에 따뜻한 조언을 건네는 대가의 풍모를 유지하세요. 
답변은 명확하고 구체적이어야 합니다. 애매모호한 표현보다는 확신에 찬 어조를 사용하세요.`;

      const response = await genAI.models.generateContent({
        model: model,
        contents: messages.concat(userMessage).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
          topP: 0.95,
        },
      });

      const modelText = response.text || "별들이 잠시 가려졌군요. 다시 한번 말씀해 주시겠습니까?";
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: modelText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "우주의 기운이 불안정하여 연결이 끊겼습니다. 잠시 후 다시 시도해 주세요.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mystic-gradient font-sans text-slate-200 overflow-hidden flex flex-col">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-700 shadow-[0_0_10px_white]" />
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-1000 shadow-[0_0_10px_white]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-gold-500/10 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-500/10 rounded-full border border-gold-500/30">
            <Compass className="w-6 h-6 gold-text" />
          </div>
          <div>
            <h1 className="font-serif text-2xl gold-text tracking-widest">운빠리</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">World Class Astrologer</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <History className="w-5 h-5 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Stars className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-center items-center gap-8"
            >
              <div className="text-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block p-4 rounded-full border-2 border-dashed border-gold-500/30 mb-4"
                >
                  <Sparkles className="w-12 h-12 gold-text" />
                </motion.div>
                <h2 className="text-4xl font-serif gold-text leading-tight">
                  당신의 운명을<br />마주할 준비가 되셨나요?
                </h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  세계 최고의 점성술사 운빠리가<br />별들의 언어를 통해 당신의 길을 밝혀드립니다.
                </p>
              </div>

              <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-6 shadow-2xl">
                <div className="space-y-2">
                  <label className="text-xs text-gold-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3 h-3" /> 성함
                  </label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full bg-mystic-950/50 border border-gold-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gold-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> 생년월일
                    </label>
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-mystic-950/50 border border-gold-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gold-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3 h-3" /> 태어난 시간 (선택)
                    </label>
                    <input 
                      type="time" 
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-mystic-950/50 border border-gold-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  disabled={!userName || !birthDate}
                  className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-slate-700 disabled:text-slate-500 text-mystic-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-gold-500/20"
                >
                  상담 시작하기
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-gold-500 text-mystic-950 rounded-tr-none font-medium' 
                        : 'glass-panel text-slate-200 rounded-tl-none border-l-4 border-l-gold-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'model' ? (
                          <Sparkles className="w-3 h-3 gold-text" />
                        ) : (
                          <User className="w-3 h-3 opacity-50" />
                        )}
                        <span className="text-[10px] uppercase tracking-widest opacity-60">
                          {msg.role === 'model' ? '운빠리' : userName}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {msg.text}
                      </p>
                      <div className="mt-2 text-[8px] opacity-40 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="glass-panel p-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-150" />
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-300" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="mt-4 relative">
                <div className="absolute inset-0 bg-gold-500/5 blur-xl rounded-full pointer-events-none" />
                <div className="relative glass-panel p-2 rounded-2xl flex items-center gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="운명에 대해 질문하세요..."
                    className="flex-1 bg-transparent border-none px-4 py-3 focus:outline-none text-slate-200 placeholder:text-slate-500"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="p-3 bg-gold-500 hover:bg-gold-400 disabled:bg-slate-700 text-mystic-950 rounded-xl transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] text-center mt-3 text-slate-500 italic">
                  "별들은 거짓말을 하지 않습니다. 오직 진실만을 전할 뿐입니다."
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="relative z-10 p-4 text-center text-[10px] text-slate-600 tracking-widest uppercase">
        © 2026 Unppari Astrology • Celestial Guidance System
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
      `}} />
    </div>
  );
}
