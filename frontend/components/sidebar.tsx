'use client';

import React from 'react';
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
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Overview', href: '/overview', icon: LayoutDashboard },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
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
              onClick={() => signIn()}
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
  );
}
