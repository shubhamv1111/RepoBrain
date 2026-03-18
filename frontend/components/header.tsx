'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface HeaderProps {
  breadcrumb?: { label: string; href?: string }[];
  showSearch?: boolean;
}

export function Header({ breadcrumb, showSearch = false }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
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
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-border-dark overflow-hidden relative">
              <Image
                src="https://picsum.photos/seed/user/32/32"
                alt="User profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={() => signIn()}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/10"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </header>
  );
}
