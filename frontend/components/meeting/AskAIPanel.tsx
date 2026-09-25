'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { api } from '@/lib/api';

interface AskAIPanelProps {
  meetingId: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const AskAIPanel: React.FC<AskAIPanelProps> = ({ meetingId }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello. I am Velora Intelligence. Ask me any question grounded directly in this meeting transcript or summary.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const predefinedQuestions = [
    'What decisions were made?',
    'What did John say about the backend?',
    'Show unresolved action items.'
  ];

  const handleAsk = async (qText: string) => {
    if (!qText.trim()) return;
    const userQ = qText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.askAI(meetingId, userQ);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, I encountered an issue analyzing the transcript.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFCFD] border border-[#E5DDE2] rounded-2xl p-6 space-y-4 shadow-xs flex flex-col h-[520px]">
      <div className="flex items-center gap-2 pb-3 border-b border-[#E5DDE2] shrink-0">
        <span className="text-base font-bold text-[#9B5C83]">✦</span>
        <h2 className="text-base font-semibold text-[#211A20] font-serif-display">✦ ASK VELORA</h2>
      </div>

      {/* Suggested Chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {predefinedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            className="text-[11px] font-sans-ui px-2.5 py-1 rounded-full bg-[#F3E7EE] hover:bg-[#9B5C83]/20 text-[#9B5C83] border border-[#9B5C83]/30 transition-all text-left"
          >
            <span className="mr-1 text-[#9B5C83]">✦</span> {q}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#F3EEF1] rounded-xl border border-[#E5DDE2]/80 velora-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-md bg-[#9B5C83] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                ✦
              </div>
            )}

            <div
              className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed font-sans-ui ${
                msg.sender === 'user'
                  ? 'bg-[#713F5A] text-white rounded-tr-none'
                  : 'bg-[#FFFCFD] text-[#211A20] rounded-tl-none border border-[#E5DDE2]'
              }`}
            >
              {msg.text}
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-md bg-[#9B5C83] text-white flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#9B5C83] p-2 font-sans-ui">
            <Sparkles className="w-4 h-4 animate-spin text-[#9B5C83]" />
            <span>Velora is analyzing meeting context...</span>
          </div>
        )}
      </div>

      {/* Question Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex gap-2 shrink-0 pt-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about this meeting..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFCFD] border border-[#E5DDE2] text-[#211A20] text-xs font-sans-ui focus:outline-none focus:border-[#9B5C83] placeholder-[#9A9097]"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2 rounded-xl bg-[#9B5C83] hover:bg-[#713F5A] text-white text-xs font-medium transition-colors disabled:opacity-40 font-sans-ui"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
