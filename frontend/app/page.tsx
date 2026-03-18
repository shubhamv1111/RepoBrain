'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { 
  Link as LinkIcon, 
  ArrowRight, 
  RefreshCw, 
  BarChart3, 
  Database,
  Folder,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

const recentRepos = [
  { name: 'vercel/next.js', stars: '112k', time: '2 days ago' },
  { name: 'facebook/react', stars: '215k', time: '5 days ago' },
  { name: 'tailwindlabs/tailwindcss', stars: '75k', time: '1 week ago' },
];

export default function HomePage() {
  const [url, setUrl] = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto pt-20 pb-12 px-6">
          <div className="max-w-[640px] mx-auto w-full">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight leading-tight mb-4"
              >
                Understand any repository, instantly.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400 text-lg"
              >
                Analyze, index, and chat with your codebase in seconds.
              </motion.p>
            </div>

            {/* Input Field */}
            <div className="relative mb-12 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <LinkIcon className="w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-14 pl-12 pr-14 bg-card-dark border border-border-dark rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                placeholder="Enter a GitHub URL..."
              />
              <button className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="relative flex justify-between items-center mb-20">
              <div className="absolute top-1/2 left-0 w-full h-px bg-border-dark -z-10"></div>
              
              <div className="flex flex-col items-center gap-3 bg-background-dark px-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-background-dark flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">1. Syncing</span>
              </div>

              <div className="flex flex-col items-center gap-3 bg-background-dark px-4">
                <div className="w-8 h-8 rounded-full border-2 border-border-dark bg-background-dark flex items-center justify-center text-slate-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">2. Analyzing</span>
              </div>

              <div className="flex flex-col items-center gap-3 bg-background-dark px-4">
                <div className="w-8 h-8 rounded-full border-2 border-border-dark bg-background-dark flex items-center justify-center text-slate-600">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">3. Indexing</span>
              </div>
            </div>

            {/* Recent Repositories */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Repositories</h3>
                <button className="text-xs font-semibold text-primary hover:underline">View all</button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {recentRepos.map((repo, i) => (
                  <motion.div 
                    key={repo.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex items-center justify-between p-4 bg-card-dark border border-border-dark rounded-xl hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                        <Folder className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200">{repo.name}</h4>
                        <p className="text-xs text-slate-500">Indexed {repo.time} • {repo.stars} stars</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="p-6 border-t border-border-dark text-center">
          <p className="text-slate-600 text-xs">RepoBrain © 2024. All indexed repositories are public domain or explicitly granted.</p>
        </footer>
      </div>
    </div>
  );
}
