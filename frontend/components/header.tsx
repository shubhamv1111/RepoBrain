'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, Search, X, Github } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface HeaderProps {
  breadcrumb?: { label: string; href?: string }[];
  showSearch?: boolean;
}

function SignInModal({ onClose }: { onClose: () => void }) {
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
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.349-.346z" />
            </svg>
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
          By signing in, you agree to our terms. Public repos work without login.
        </p>
      </div>
    </div>
  );
}

export function Header({ breadcrumb, showSearch = false }: HeaderProps) {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && <SignInModal onClose={() => setShowModal(false)} />}
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-dark bg-background-dark/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb ? (
            breadcrumb.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <span className="text-slate-600">/</span>}
                <span className={index === breadcrumb.length - 1 ? "font-bold text-slate-100" : "text-slate-400 hover:text-slate-100 cursor-pointer transition-colors"}>
                  {item.label}
                </span>
              </React.Fragment>
            ))
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <button className="p-2 text-slate-400 hover:text-slate-100 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-background-dark" />
          </button>

          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-border-dark overflow-hidden relative">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                    {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-border-dark flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/10"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}
