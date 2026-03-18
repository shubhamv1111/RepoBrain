"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useAppStore } from "@/lib/store";

export default function RepoLayout({ children }: { children: React.ReactNode }) {
  const currentRepo = useAppStore((s) => s.currentRepo);

  // Build breadcrumb from the current repo if available
  const breadcrumb = currentRepo
    ? [
        { label: currentRepo.owner },
        { label: currentRepo.name },
      ]
    : [{ label: "Repository" }];

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header breadcrumb={breadcrumb} showSearch />
        {/* This wrapping div fills the remaining height below the header */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
