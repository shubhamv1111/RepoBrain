'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BrainCircuit,
  Settings,
  BookOpen,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

// ── Sidebar ───────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const recentRepos = useAppStore((s) => s.recentRepos);
  const currentRepo = useAppStore((s) => s.currentRepo);

  return (
    <>
      <aside className="w-64 flex-shrink-0 flex flex-col bg-sidebar-dark border-r border-border-dark hidden md:flex h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">RepoBrain</h1>
        </div>

        {/* Top nav — just Home */}
        <nav className="px-4 space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              pathname === '/'
                ? "bg-primary/10 text-primary"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            )}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </Link>
        </nav>

        {/* Current repo section */}
        {currentRepo && (
          <div className="px-4 mt-5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-3">Current Repo</p>
            <div className="bg-white/5 border border-border-dark rounded-lg px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentRepo.owner}/{currentRepo.name}</p>
              <p className="text-[10px] text-slate-500 capitalize mt-0.5">{currentRepo.status}</p>
            </div>
            <div className="space-y-0.5">
              {[
                { label: 'Overview', path: `/repo/${currentRepo._id}` },
                { label: 'Chat', path: `/repo/${currentRepo._id}/chat` },
                { label: 'Insights', path: `/repo/${currentRepo._id}/insights` },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors text-sm",
                    pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent repos */}
        {recentRepos.length > 0 && (
          <div className="px-4 mt-5 flex-1 overflow-y-auto min-h-0">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-3">Recent</p>
            <div className="space-y-0.5">
              {recentRepos.map((repo) => (
                <button
                  key={repo._id}
                  onClick={() => router.push(`/repo/${repo._id}`)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-left",
                    currentRepo?._id === repo._id
                      ? "bg-primary/5 text-slate-200"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  )}
                >
                  <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs truncate">{repo.owner}/{repo.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!currentRepo && recentRepos.length === 0 && (
          <div className="flex-1" />
        )}

        {/* Bottom actions */}
        <div className="p-4 border-t border-border-dark space-y-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              pathname === '/settings'
                ? "bg-primary/10 text-primary"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link
            href="/docs"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              pathname === '/docs'
                ? "bg-primary/10 text-primary"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            )}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Docs</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
