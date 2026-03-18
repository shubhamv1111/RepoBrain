'use client';

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { 
  Network, 
  AlertCircle, 
  Flame, 
  History,
  Search,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'graph', label: 'Dependency Graph', active: true },
  { id: 'arch', label: 'Architecture' },
  { id: 'issues', label: 'Issues' },
  { id: 'hotspots', label: 'Hotspots' },
  { id: 'qa', label: 'Commit Q&A' },
];

const issues = [
  { id: '#42091', title: 'Hydration failed because initial UI does not match server', severity: 'High', color: 'text-red-400', time: '2 days ago', author: 'timneutkens' },
  { id: '#41982', title: 'Middleware rewrite results in 404 on production', severity: 'Med', color: 'text-amber-400', time: '4 days ago', author: 'leerob' },
  { id: '#41870', title: 'Documentation update for next/font features', severity: 'Low', color: 'text-slate-400', time: '1 week ago', author: 'delbaolivier' },
];

const hotspots = [
  { path: 'packages/next/server/render.tsx', level: 'Very High', percent: 100 },
  { path: 'packages/next/client/router.ts', level: 'High', percent: 75 },
];

export default function InsightsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          breadcrumb={[
            { label: 'vercel' },
            { label: 'next.js' },
            { label: 'insights' }
          ]}
        />
        
        <main className="flex-1 overflow-y-auto bg-background-dark p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Title & Description */}
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Repository Insights</h2>
              <p className="text-slate-400 mt-1">Deep analysis of dependencies, architecture, and maintenance hotspots.</p>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-border-dark flex gap-8">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  className={cn(
                    "pb-4 text-sm transition-colors relative",
                    tab.active 
                      ? "font-bold text-primary" 
                      : "font-medium text-slate-400 hover:text-slate-100"
                  )}
                >
                  {tab.label}
                  {tab.active && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-8">
              {/* Dependency Graph Section */}
              <div className="bg-card-dark rounded-xl border border-border-dark p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-100">Dependency Graph</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded border border-border-dark hover:bg-slate-700 transition-colors">Zoom In</button>
                    <button className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded border border-border-dark hover:bg-slate-700 transition-colors">Recenter</button>
                  </div>
                </div>
                
                <div className="aspect-video w-full rounded-lg bg-slate-900/50 border border-border-dark/50 flex items-center justify-center relative overflow-hidden">
                  {/* SVG Dependency Tree Mockup */}
                  <svg className="w-full h-full p-12" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="#1e1e26" strokeWidth="1.5">
                      <line x1="400" x2="250" y1="225" y2="125" />
                      <line x1="400" x2="550" y1="225" y2="125" />
                      <line x1="400" x2="580" y1="225" y2="280" />
                      <line x1="400" x2="220" y1="225" y2="300" />
                      <line x1="400" x2="400" y1="225" y2="80" />
                    </g>
                    <circle cx="400" cy="225" fill="#f97316" r="12" />
                    <text x="400" y="255" fill="#f97316" fontSize="14" fontWeight="bold" textAnchor="middle">next.js</text>
                    
                    <circle cx="250" cy="125" fill="#3b82f6" r="6" />
                    <text x="250" y="110" fill="#cbd5e1" fontSize="11" textAnchor="middle">react</text>
                    
                    <circle cx="550" cy="125" fill="#3b82f6" r="6" />
                    <text x="550" y="110" fill="#cbd5e1" fontSize="11" textAnchor="middle">react-dom</text>
                    
                    <circle cx="580" cy="280" fill="#f97316" r="6" />
                    <text x="580" y="305" fill="#cbd5e1" fontSize="11" textAnchor="middle">typescript</text>
                    
                    <circle cx="220" cy="300" fill="#3b82f6" r="6" />
                    <text x="220" y="325" fill="#cbd5e1" fontSize="11" textAnchor="middle">postcss</text>
                    
                    <circle cx="400" cy="80" fill="#3b82f6" r="6" />
                    <text x="400" y="65" fill="#cbd5e1" fontSize="11" textAnchor="middle">swc</text>
                  </svg>

                  <div className="absolute bottom-4 right-4 bg-card-dark/80 backdrop-blur p-3 rounded-lg border border-border-dark text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-blue-500" /> Production</div>
                    <div className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-primary" /> Dev Dependencies</div>
                    <div className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-slate-500" /> Peer</div>
                  </div>
                </div>
              </div>

              {/* Architecture Card */}
              <div className="bg-card-dark rounded-xl border border-border-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Network className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-100">Project Architecture</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Next.js core repository follows a monorepo structure using pnpm workspaces. The architecture is designed for modularity between the framework, the compiler (SWC), and built-in components.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-border-dark">
                        <span className="text-sm font-medium text-slate-300">/packages</span>
                        <span className="text-xs text-slate-500">Framework &amp; Components</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-border-dark">
                        <span className="text-sm font-medium text-slate-300">/examples</span>
                        <span className="text-xs text-slate-500">Sample Implementations</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 border border-border-dark">
                    <div className="text-primary">// root directory</div>
                    <div>├── .github</div>
                    <div>├── examples/</div>
                    <div>├── packages/</div>
                    <div className="pl-4 text-slate-300">├── next/</div>
                    <div className="pl-4 text-slate-300">├── next-swc/</div>
                    <div className="pl-4 text-slate-300">└── eslint-plugin-next/</div>
                    <div>├── scripts/</div>
                    <div>└── turbo.json</div>
                  </div>
                </div>
              </div>

              {/* Issues & Hotspots Split */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Issues List */}
                <div className="bg-card-dark rounded-xl border border-border-dark p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-100">Open Issues</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">124 Critical</span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                    {issues.map((issue) => (
                      <div 
                        key={issue.id}
                        className="p-3 bg-slate-900/40 rounded-lg border border-border-dark hover:border-slate-700 transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={cn("text-xs font-bold uppercase tracking-wider", issue.color)}>Severity: {issue.severity}</span>
                          <span className="text-xs text-slate-500">{issue.id}</span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-200 group-hover:text-primary transition-colors">{issue.title}</h4>
                        <p className="text-xs text-slate-500 mt-2">Opened {issue.time} by {issue.author}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotspots Heatmap */}
                <div className="bg-card-dark rounded-xl border border-border-dark p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-100">Maintenance Hotspots</h3>
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-10 gap-1 h-32">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div 
                          key={i}
                          className="bg-primary rounded-sm"
                          style={{ opacity: Math.random() * 0.9 + 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="space-y-4 mt-4">
                      {hotspots.map((h) => (
                        <div key={h.path} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 truncate max-w-[200px]">{h.path}</span>
                            <span className="text-primary font-bold">{h.level}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1">
                            <div className="bg-primary h-1 rounded-full" style={{ width: `${h.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commit Q&A Section */}
              <div className="bg-card-dark rounded-xl border border-border-dark p-6">
                <div className="flex items-center gap-3 mb-6">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-100">Commit Q&A</h3>
                </div>
                <div className="relative mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    className="w-full bg-slate-900 border-border-dark rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-primary focus:border-primary text-slate-200 outline-none border" 
                    placeholder="Ask about recent changes (e.g., 'What changed in the router last week?')"
                  />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/30 rounded-lg border border-border-dark">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-200 italic">&quot;How has the image component evolved in the last 10 commits?&quot;</p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          The <code className="bg-slate-900 px-1 rounded text-primary">next/image</code> component has received several optimizations for lazy-loading behavior. In commit <code className="text-slate-300">7f2a1b</code>, priority loading was refined to reduce LCP. In <code className="text-slate-300">b3e92c</code>, experimental support for AVIF formats was extended.
                        </p>
                      </div>
                    </div>
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
