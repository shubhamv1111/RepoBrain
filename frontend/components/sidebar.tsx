'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { 
  Home, 
  LayoutDashboard, 
  MessageSquare, 
  Lightbulb, 
  BrainCircuit,
  UserCircle,
  ChevronDown,
  Settings,
  BookOpen,
  LogOut,
  LogIn,
  Github,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
];

function SidebarSignInPanel({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: 'github' | 'google') => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111116] border border-[#1e1e26] rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Sign in to RepoBrain</h2>
          <p className="text-slate-400 text-sm mt-2">Access private repos and higher rate limits</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSignIn('github')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-[#1e1e26] hover:border-slate-600 rounded-xl text-slate-200 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github className="w-5 h-5" />
            {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
          </button>

          <button
            onClick={() => handleSignIn('google')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-[#1e1e26] hover:border-slate-600 rounded-xl text-slate-200 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-6">
          Public repos work without signing in.
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      {showSignIn && <SidebarSignInPanel onClose={() => setShowSignIn(false)} />}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-sidebar-dark border-r border-border-dark hidden md:flex h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">RepoBrain</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-dark space-y-2">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Docs</span>
          </Link>
          
          <div className="pt-2 relative">
            {status === 'authenticated' && session?.user ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-border-dark text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={20}
                        height={20}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserCircle className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {session.user.name || session.user.email}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", userMenuOpen && "rotate-180")} />
                </button>
                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 w-full mb-1 bg-card-dark border border-border-dark rounded-lg overflow-hidden shadow-xl">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-border-dark text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium">Sign In</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
