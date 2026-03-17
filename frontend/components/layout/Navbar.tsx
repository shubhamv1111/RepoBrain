"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { ChevronDown, Github, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const currentRepo = useAppStore((s) => s.currentRepo);
  const router = useRouter();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5"
      style={{
        height: "var(--rb-navbar-height)",
        background: "var(--rb-bg-page)",
        borderBottom: "1px solid var(--rb-border)",
      }}
    >
      {/* Left — Wordmark */}
      <button
        onClick={() => router.push("/")}
        className="text-sm font-medium tracking-tight cursor-pointer"
        style={{ color: "var(--rb-text-primary)" }}
      >
        RepoBrain
      </button>

      {/* Center — Repo selector */}
      {currentRepo && (
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer"
          style={{
            background: "var(--rb-bg-card)",
            border: "1px solid var(--rb-border)",
            color: "var(--rb-text-primary)",
          }}
        >
          {currentRepo.name}
          <ChevronDown size={14} className="text-rb-text-muted" />
        </button>
      )}

      {/* Right — Auth */}
      {session?.user ? (
        <div className="flex items-center gap-3">
          <img
            src={session.user.image || ""}
            alt={session.user.name || "User"}
            className="w-7 h-7 rounded-full"
          />
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              color: "var(--rb-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--rb-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--rb-bg-card)";
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              color: "var(--rb-text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--rb-bg-hover)";
              e.currentTarget.style.color = "var(--rb-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--rb-bg-card)";
              e.currentTarget.style.color = "var(--rb-text-secondary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors"
            style={{
              background: "var(--rb-bg-card)",
              border: "1px solid var(--rb-border)",
              color: "var(--rb-text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--rb-bg-hover)";
              e.currentTarget.style.color = "var(--rb-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--rb-bg-card)";
              e.currentTarget.style.color = "var(--rb-text-secondary)";
            }}
          >
            <Github size={16} />
            GitHub
          </button>
        </div>
      )}
    </nav>
  );
}
