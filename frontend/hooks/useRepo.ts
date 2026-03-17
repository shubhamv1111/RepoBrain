"use client";

import { useQuery } from "@tanstack/react-query";
import { getRepoOverview } from "@/lib/api";
import type { OverviewData } from "@/types";

export function useRepo(repoId: string) {
  return useQuery<OverviewData>({
    queryKey: ["repo", repoId],
    queryFn: async () => {
      const res = await getRepoOverview(repoId);
      return res.data;
    },
    enabled: !!repoId,
  });
}
