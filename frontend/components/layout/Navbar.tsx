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
          Login with GitHub
        </button>
      )}
    </nav>
  );
}
