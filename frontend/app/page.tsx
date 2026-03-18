'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { 
  Link as LinkIcon, 
  ArrowRight, 
  RefreshCw,
  BarChart3,
  Database,
  CheckCircle2,
  XCircle,
  Folder,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ingestRepo, getRepoStatusSSE } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { JobStep } from '@/types';

type IngestionState = 'idle' | 'running' | 'done' | 'error';

const STEPS = [
  { name: 'clone' as const, label: '1. Syncing',   Icon: RefreshCw,  spin: true  },
  { name: 'parse' as const, label: '2. Analyzing', Icon: BarChart3,  spin: false },
  { name: 'embed' as const, label: '3. Indexing',  Icon: Database,   spin: false },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [ingestionState, setIngestionState] = useState<IngestionState>('idle');
  const [steps, setSteps] = useState<JobStep[]>([
    { name: 'clone', status: 'pending', message: '', percent: 0 },
    { name: 'parse', status: 'pending', message: '', percent: 0 },
    { name: 'embed', status: 'pending', message: '', percent: 0 },
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  const recentRepos = useAppStore((s) => s.recentRepos);
  const sseRef = useRef<EventSource | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || ingestionState === 'running') return;

    setIngestionState('running');
    setErrorMsg('');
    setSteps([
      { name: 'clone', status: 'pending', message: '', percent: 0 },
      { name: 'parse', status: 'pending', message: '', percent: 0 },
      { name: 'embed', status: 'pending', message: '', percent: 0 },
    ]);

    try {
      const res = await ingestRepo(trimmed);
      const id: string = res.data.repoId;

      const sse = getRepoStatusSSE(id);
      sseRef.current = sse;

      sse.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          const { step, percent, message, status } = event;

          setSteps((prev) =>
            prev.map((s) =>
              s.name === step
                ? { ...s, status: status as JobStep['status'], message: message || '', percent: percent ?? s.percent }
                : s
            )
          );

          if (status === 'done' && step === 'embed') {
            sse.close();
            setIngestionState('done');
            setTimeout(() => router.push(`/repo/${id}`), 1200);
          }

          if (status === 'failed') {
            sse.close();
            setIngestionState('error');
            setErrorMsg(message || 'Ingestion failed');
          }
        } catch { /* ignore */ }
      };

      sse.onerror = () => {
        sse.close();
        setIngestionState('error');
        setErrorMsg('Lost connection to server');
      };
    } catch (err: unknown) {
      setIngestionState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start ingestion');
    }
  }, [url, ingestionState, router]);

  const handleReset = () => {
    sseRef.current?.close();
    setIngestionState('idle');
    setUrl('');
    setErrorMsg('');
    setSteps([
      { name: 'clone', status: 'pending', message: '', percent: 0 },
      { name: 'parse', status: 'pending', message: '', percent: 0 },
      { name: 'embed', status: 'pending', message: '', percent: 0 },
    ]);
  };

  const isRunning = ingestionState === 'running';
  const isDone    = ingestionState === 'done';
  const isError   = ingestionState === 'error';

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto pt-20 pb-12 px-6">
          <div className="max-w-[640px] mx-auto w-full">

            {/* Hero */}
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

            {/* URL Input */}
            <div className="relative mb-12 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <LinkIcon className="w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isRunning}
                className="w-full h-14 pl-12 pr-14 bg-card-dark border border-border-dark rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base disabled:opacity-60"
                placeholder="https://github.com/owner/repo"
              />
              <button
                onClick={handleSubmit}
                disabled={!url.trim() || isRunning}
                className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* ── Horizontal Stepper ── */}
            <div className="relative flex justify-between items-center mb-8">
              {/* Connecting line */}
              <div className="absolute top-4 left-0 w-full h-px bg-border-dark -z-10" />
              
              {/* Progress fill */}
              {isRunning && (
                <div
                  className="absolute top-4 left-0 h-px bg-primary transition-all duration-700 -z-10"
                  style={{
                    width: steps.filter(s => s.status === 'done').length === 0
                      ? '0%'
                      : steps.filter(s => s.status === 'done').length === 1
                      ? '50%'
                      : steps.filter(s => s.status === 'done').length === 2
                      ? '100%'
                      : '0%',
                  }}
                />
              )}
              {isDone && (
                <div className="absolute top-4 left-0 w-full h-px bg-green-500 -z-10 transition-all duration-700" />
              )}

              {STEPS.map((step, i) => {
                const jobStep = steps.find(s => s.name === step.name);
                const status  = jobStep?.status ?? 'pending';
                const isActive = status === 'active';
                const isDoneStep = status === 'done';
                const isFailed = status === 'failed';

                const circleClass = cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isDoneStep  ? "border-green-500 bg-green-500/10 text-green-400"
                  : isFailed  ? "border-red-500 bg-red-500/10 text-red-400"
                  : isActive  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-dark bg-background-dark text-slate-600"
                );

                const labelClass = cn(
                  "text-xs font-semibold uppercase tracking-widest mt-3",
                  isDoneStep  ? "text-green-400"
                  : isFailed  ? "text-red-400"
                  : isActive  ? "text-slate-300"
                  : "text-slate-500"
                );

                return (
                  <div key={step.name} className="flex flex-col items-center bg-background-dark px-4">
                    <div className={circleClass}>
                      {isDoneStep ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isFailed ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <step.Icon
                          className={cn("w-4 h-4", isActive && step.spin && "animate-spin")}
                          style={isActive && step.spin ? { animationDuration: '1.5s' } : {}}
                        />
                      )}
                    </div>
                    <span className={labelClass}>{step.label}</span>
                    {/* Active step message */}
                    {isActive && jobStep?.message && (
                      <span className="text-[10px] text-slate-600 mt-1 max-w-[100px] text-center truncate">
                        {jobStep.message}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status messages below stepper */}
            <AnimatePresence mode="wait">
              {isError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 flex items-center gap-3 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl"
                >
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400 flex-1">{errorMsg}</p>
                  <button onClick={handleReset} className="text-xs text-primary hover:underline flex-shrink-0">
                    Try again
                  </button>
                </motion.div>
              )}

              {isDone && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 flex items-center gap-3 px-4 py-3 bg-green-500/5 border border-green-500/20 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-green-400">Ready! Redirecting to overview…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Repositories */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Repositories</h3>
              </div>

              {recentRepos.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">No repositories indexed yet. Paste a GitHub URL above to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {recentRepos.map((repo, i) => (
                    <motion.div
                      key={repo._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/repo/${repo._id}`)}
                      className="group flex items-center justify-between p-4 bg-card-dark border border-border-dark rounded-xl hover:border-slate-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                          <Folder className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-200">{repo.owner}/{repo.name}</h4>
                          <p className="text-xs text-slate-500">
                            {repo.metrics?.filesIndexed ?? 0} files indexed
                            {repo.status === 'ready' ? ' • Ready' : ` • ${repo.status}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>

        <footer className="p-6 border-t border-border-dark text-center">
          <p className="text-slate-600 text-xs">RepoBrain © 2024. Powered by AI + ChromaDB.</p>
        </footer>
      </div>
    </div>
  );
}
