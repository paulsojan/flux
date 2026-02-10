"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailFilters } from "@/lib/types";
import { buildGmailQuery } from "@/lib/gmail-query";

const INITIAL_FILTERS: EmailFilters = {
  keyword: "",
  readStatus: "all",
};

export function useEmailFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    const handler = () => {
      setFilters(INITIAL_FILTERS);
      setDebouncedFilters(INITIAL_FILTERS);
    };
    window.addEventListener("agent:clear-filters", handler);
    return () => window.removeEventListener("agent:clear-filters", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters]);

  const gmailQuery = useMemo(
    () => buildGmailQuery(debouncedFilters),
    [debouncedFilters],
  );

  useEffect(() => {
    const currentQ = searchParams.get("query") ?? "";

    if (!gmailQuery && currentQ) {
      router.replace("?");
      return;
    }

    if (gmailQuery && gmailQuery !== currentQ) {
      router.replace(`?query=${encodeURIComponent(gmailQuery)}`, {
        scroll: false,
      });
    }
  }, [gmailQuery, router, searchParams]);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setDebouncedFilters(INITIAL_FILTERS);
    router.replace("?");
  }, [router]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    filters,
    clearFilters,
    updateFilter,
  };
}
