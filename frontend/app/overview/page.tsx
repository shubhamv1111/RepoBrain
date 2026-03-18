'use client';

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  Image as ImageIcon, 
  Search,
  Zap,
  Copy,
  Users,
  Star,
  GitCommit,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const metrics = [
  { label: 'Commits', value: '12.4k', icon: GitCommit },
  { label: 'Stars', value: '105k', icon: Star },
  { label: 'Contributors', value: '2.1k', icon: Users },
  { label: 'Issues', value: '430', icon: AlertCircle },
];

const languages = [
  { name: 'TypeScript', percent: 78.2, color: 'bg-blue-500' },
  { name: 'JavaScript', percent: 14.8, color: 'bg-yellow-400' },
  { name: 'CSS', percent: 7.0, color: 'bg-purple-500' },
];

export default function OverviewPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          breadcrumb={[
            { label: 'vercel' },
            { label: 'next.js' }
          ]}
          showSearch
        />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left Column: File Tree */}
          <div className="w-[250px] border-r border-border-dark bg-card-dark overflow-y-auto p-4 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Files</h3>
              <Search className="w-3 h-3 text-slate-400" />
            </div>
            <ul className="text-sm space-y-1 text-slate-400">
              <li className="flex items-center gap-2 py-1 px-2 hover:bg-primary/5 rounded cursor-pointer text-slate-200">
                <ChevronDown className="w-4 h-4" />
                <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>src</span>
              </li>
              <li className="flex items-center gap-2 py-1 px-4 hover:bg-primary/5 rounded cursor-pointer">
                <ChevronRight className="w-4 h-4" />
                <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>app</span>
              </li>
              <li className="flex items-center gap-2 py-1 px-4 hover:bg-primary/5 rounded cursor-pointer">
                <ChevronRight className="w-4 h-4" />
                <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>components</span>
              </li>
              <li className="flex items-center gap-2 py-1 px-2 hover:bg-primary/5 rounded cursor-pointer">
                <ChevronDown className="w-4 h-4" />
                <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span>public</span>
              </li>
              <li className="flex items-center gap-2 py-1 px-6 hover:bg-primary/5 rounded cursor-pointer">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>logo.svg</span>
              </li>
              <li className="flex items-center gap-2 py-1 px-2 hover:bg-primary/5 rounded cursor-pointer">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>package.json</span>
              </li>
              <li className="flex items-center gap-2 py-1 px-2 hover:bg-primary/5 rounded cursor-pointer">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>tsconfig.json</span>
              </li>
            </ul>
          </div>

          {/* Center Column: Fluid Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card-dark border border-border-dark p-4 rounded-lg"
                >
                  <p className="text-xs text-slate-500 font-medium">{m.label}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Summary Section */}
            <section className="bg-card-dark border border-border-dark rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold">AI Repository Summary</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">AI Engine</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                Next.js is a high-performance React framework designed for full-stack production environments. This repository implements core features like Server Components, advanced routing, and built-in CSS support. The architecture prioritizes developer experience and optimized bundle delivery.
              </p>
              <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Generate Deep Dive
              </button>
            </section>

            {/* File Preview Area */}
            <section className="bg-card-dark border border-border-dark rounded-lg overflow-hidden">
              <div className="bg-background-dark/50 px-4 py-2 border-b border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-300 font-mono">next.config.js</span>
                </div>
                <Copy className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />
              </div>
              <div className="p-6 font-mono text-sm leading-6 overflow-x-auto bg-[#0d0d12]">
                <p><span className="text-[#ff7b72]">{`/** @type {import('next').NextConfig} */`}</span></p>
                <p><span className="text-[#ff7b72]">const</span> <span className="text-[#d2a8ff]">nextConfig</span> = {"{"}</p>
                <p className="pl-4"><span className="text-[#79c0ff]">reactStrictMode</span>: <span className="text-[#79c0ff]">true</span>,</p>
                <p className="pl-4"><span className="text-[#79c0ff]">experimental</span>: {"{"}</p>
                <p className="pl-8"><span className="text-[#79c0ff]">appDir</span>: <span className="text-[#79c0ff]">true</span>,</p>
                <p className="pl-8"><span className="text-[#79c0ff]">serverComponentsExternalPackages</span>: [<span className="text-[#a5d6ff]">&apos;@prisma/client&apos;</span>],</p>
                <p className="pl-4">{"}"},{`}`};</p>
                <p><span className="text-[#ff7b72]">module.exports</span> = <span className="text-[#d2a8ff]">nextConfig</span>;</p>
              </div>
            </section>
          </div>

          {/* Right Column: Stats & Info */}
          <div className="w-[300px] border-l border-border-dark bg-background-dark overflow-y-auto p-6 space-y-6 hidden xl:block">
            {/* Language Stats */}
            <div className="bg-card-dark border border-border-dark rounded-lg p-5">
              <h3 className="text-sm font-bold mb-4">Languages</h3>
              <div className="flex h-2 w-full rounded-full overflow-hidden mb-4">
                {languages.map((lang) => (
                  <div 
                    key={lang.name}
                    className={`h-full ${lang.color}`} 
                    style={{ width: `${lang.percent}%` }}
                    title={lang.name}
                  />
                ))}
              </div>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${lang.color}`} />
                      <span className="text-slate-300">{lang.name}</span>
                    </div>
                    <span className="text-slate-500">{lang.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Summary */}
            <div className="bg-card-dark border border-border-dark rounded-lg p-5">
              <h3 className="text-sm font-bold mb-4">Architecture Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stack</p>
                  <p className="text-xs text-slate-300">React 18, SWC Compiler, Rust internals, Webpack 5, Turbopack.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Structure</p>
                  <p className="text-xs text-slate-300">Monorepo using pnpm workspaces. Core logic in <code className="bg-slate-800 px-1 rounded">packages/next</code>. Testing suite in <code className="bg-slate-800 px-1 rounded">test/</code>.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Maintainers</p>
                  <div className="flex -space-x-2 mt-2">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="size-6 rounded-full border-2 border-card-dark bg-slate-600 relative overflow-hidden"
                      >
                        <img 
                          src={`https://picsum.photos/seed/maintainer${i}/24/24`} 
                          alt="Maintainer"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="size-6 rounded-full border-2 border-card-dark bg-slate-800 flex items-center justify-center text-[8px] font-bold">+12</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
