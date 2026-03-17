"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  LayoutGrid,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Github,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const currentRepo = useAppStore((s) => s.currentRepo);
  const recentRepos = useAppStore((s) => s.recentRepos);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  const repoId = currentRepo?._id;

  const navItems: NavItem[] = repoId
    ? [
        {
          label: "Overview",
          href: `/repo/${repoId}`,
          icon: <LayoutGrid size={16} />,
        },
        {
          label: "Chat",
          href: `/repo/${repoId}/chat`,
          icon: <MessageSquare size={16} />,
        },
        {
          label: "File Explorer",
          href: `/repo/${repoId}`,
          icon: <FolderOpen size={16} />,
        },
        {
          label: "Insights",
          href: `/repo/${repoId}/insights`,
          icon: <BarChart3 size={16} />,
        },
      ]
    : [
        { label: "Overview", href: "#", icon: <LayoutGrid size={16} /> },
        { label: "Chat", href: "#", icon: <MessageSquare size={16} /> },
        { label: "File Explorer", href: "#", icon: <FolderOpen size={16} /> },
        { label: "Insights", href: "#", icon: <BarChart3 size={16} /> },
      ];

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === `/repo/${repoId}`) return pathname === href;
    return pathname.startsWith(href);
  };

  if (!sidebarOpen) return null;

  return (
    <aside
      className="fixed top-[var(--rb-navbar-height)] left-0 bottom-0 flex flex-col z-40"
      style={{
        width: "var(--rb-sidebar-width)",
        background: "var(--rb-bg-sidebar)",
        borderRight: "1px solid var(--rb-border)",
      }}
    >
      {/* Navigation */}
      <div className="flex-1 px-2 pt-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-md text-[13px] transition-colors no-underline"
              style={{
                background: active ? "var(--rb-bg-hover)" : "transparent",
                color: active
                  ? "var(--rb-text-primary)"
                  : "var(--rb-text-secondary)",
                borderLeft: active
                  ? "2px solid var(--rb-blue)"
                  : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--rb-bg-nav-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span
                style={{
                  color: active
                    ? "var(--rb-text-primary)"
                    : "var(--rb-text-muted)",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Divider + Recents */}
        <div
          className="mt-4 mb-2 mx-2"
          style={{ borderTop: "1px solid var(--rb-border-divider)" }}
        />
        <span
          className="px-3.5 mb-1 text-[10px] uppercase tracking-widest"
          style={{ color: "var(--rb-text-dim)" }}
        >
          Recents
        </span>

        {recentRepos.length === 0 ? (
          <>
            {["next.js", "langchain", "react"].map((name) => (
              <span
                key={name}
                className="block px-3.5 py-1 text-[13px] cursor-default"
                style={{ color: "var(--rb-text-muted)" }}
              >
                {name}
              </span>
            ))}
          </>
        ) : (
          recentRepos.map((repo) => (
            <Link
              key={repo._id}
              href={`/repo/${repo._id}`}
              className="px-3.5 py-1.5 text-[13px] rounded-md transition-colors no-underline"
              style={{ color: "var(--rb-text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--rb-text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--rb-text-muted)";
              }}
            >
              {repo.name}
            </Link>
          ))
        )}
      </div>

      {/* Bottom — Avatar / Login */}
      <BottomAuth />
    </aside>
  );
}

/* ── Bottom auth widget ────────────────────────────────────── */
function BottomAuth() {
  const { data: session } = useSession();

  return (
    <div
      className="px-3.5 py-3 flex items-center gap-2"
      style={{ borderTop: "1px solid var(--rb-border-divider)" }}
    >
      {session?.user ? (
        <>
          <img
            src={session.user.image || ""}
            alt={session.user.name || "User"}
            className="w-6 h-6 rounded-full"
          />
          <span
            className="text-[12px] truncate"
            style={{ color: "var(--rb-text-secondary)" }}
          >
            {session.user.name}
          </span>
        </>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-1.5 text-[12px] cursor-pointer bg-transparent border-none"
          style={{ color: "var(--rb-text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--rb-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--rb-text-muted)";
          }}
        >
          <Github size={14} />
          Login with GitHub
        </button>
      )}
    </div>
  );
}
