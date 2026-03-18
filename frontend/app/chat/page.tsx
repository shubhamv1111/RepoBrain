"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function ChatRedirect() {
  const router = useRouter();
  const currentRepo = useAppStore((s) => s.currentRepo);

  useEffect(() => {
    if (currentRepo?._id) {
      router.replace(`/repo/${currentRepo._id}/chat`);
    } else {
      router.replace("/");
    }
  }, [currentRepo, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background-dark">
      <p className="text-slate-500 text-sm">Redirecting...</p>
    </div>
  );
}
