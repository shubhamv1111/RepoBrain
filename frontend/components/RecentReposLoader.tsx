"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { loadRecentRepos } from "@/lib/store";

/** Hydrate recent repos from the backend after login or on app load. */
export default function RecentReposLoader() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      loadRecentRepos();
    }
  }, [status]);

  return null;
}
