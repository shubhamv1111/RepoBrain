'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { 
  PlusSquare, 
  Send, 
  Bot, 
  ThumbsUp, 
  Copy, 
  FileText, 
  Code, 
  FileJson,
  Layers,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sessions = [
  { id: 1, title: 'How does routing work?', time: '2 mins ago', active: true },
  { id: 2, title: 'Explain the caching layer', time: '1 hour ago' },
  { id: 3, title: 'Middleware configuration', time: 'Yesterday' },
  { id: 4, title: 'Optimizing images in v14', time: 'Yesterday' },
];

const sources = [
  { name: 'next.config.js', desc: 'Configuration for experimental features and routing rewrites.', icon: FileText, color: 'text-primary' },
  { name: 'lib/auth.ts', desc: 'Authentication middleware and session handling logic.', icon: Code, color: 'text-blue-400' },
  { name: 'app/layout.tsx', desc: 'Root layout defining the global UI structure and providers.', icon: Layers, color: 'text-green-400' },
  { name: 'middleware.ts', desc: 'Edge runtime middleware for request interception.', icon: FileJson, color: 'text-yellow-400' },
];

export default function ChatPage() {
  const [input, setInput] = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          breadcrumb={[
            { label: 'vercel' },
            { label: 'next.js' },
            { label: 'chat' }
          ]}
          showSearch
        />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left: Sessions */}
          <div className="w-[250px] border-r border-border-dark flex flex-col bg-card-dark shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sessions</h2>
              <PlusSquare className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.map((s) => (
                <div 
                  key={s.id}
                  className={cn(
                    "p-2 rounded border cursor-pointer transition-colors",
                    s.active 
                      ? "bg-white/5 border-white/10" 
                      : "hover:bg-white/5 border-transparent"
                  )}
                >
                  <p className={cn("text-xs font-medium truncate", s.active ? "text-slate-100" : "text-slate-400")}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{s.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Chat Fluid */}
          <div className="flex-1 flex flex-col bg-background-dark overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-[#16161e] p-4 rounded-xl border border-border-dark">
                  <p className="text-sm text-[#f4f4f5] leading-relaxed">
                    Can you explain how the new App Router handles nested layouts and where the data fetching should happen?
                  </p>
                </div>
              </div>

              {/* AI Message */}
              <div className="flex gap-4">
                <div className="size-8 bg-primary rounded flex items-center justify-center shrink-0 mt-1">
                  <Bot className="text-white w-5 h-5" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-tight">RepoBrain</span>
                    <span className="bg-purple-600/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">AI Engine</span>
                  </div>
                  <div className="space-y-4 text-sm text-[#f4f4f5] leading-relaxed">
                    <p>In the Next.js App Router, nested layouts are achieved by defining a <code className="bg-card-dark px-1 rounded text-primary">layout.js</code> file within specific route segments. Each layout wraps the segments beneath it.</p>
                    <p>Regarding data fetching, the best practice is to fetch data directly in the <strong>Server Components</strong> where it&apos;s needed. You can use <code className="bg-card-dark px-1 rounded text-primary">fetch</code> with automatic request memoization.</p>
                    <ul className="list-disc ml-4 space-y-2 text-slate-400">
                      <li>Layouts do not receive the current search parameters.</li>
                      <li>Data fetching in layouts is shared across all child pages.</li>
                      <li>Use <code className="bg-card-dark px-1 rounded text-primary">Suspense</code> for granular loading states.</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500">
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[10px]">Helpful</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 shrink-0">
              <div className="relative max-w-4xl mx-auto">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-card-dark border border-border-dark rounded-xl py-4 pl-4 pr-14 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none" 
                  placeholder="Ask RepoBrain..." 
                  rows={1}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 size-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-500 mt-2">RepoBrain may provide inaccurate info about your codebase. Verify key logic.</p>
            </div>
          </div>

          {/* Right: Sources */}
          <div className="w-[300px] border-l border-border-dark flex flex-col bg-background-dark shrink-0 hidden xl:flex">
            <div className="p-4 border-b border-border-dark">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Search className="w-3 h-3" />
                Sources
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sources.map((src) => (
                <div 
                  key={src.name}
                  className="p-3 rounded-lg border border-border-dark bg-card-dark group cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <src.icon className={cn("w-4 h-4", src.color)} />
                    <span className="text-xs font-medium text-slate-200">{src.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{src.desc}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border-dark">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-primary uppercase mb-1">Context Usage</p>
                <div className="h-1.5 w-full bg-border-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%]"></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">6.2k / 12k tokens used</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
