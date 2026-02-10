"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  const [prevUrlQuery, setPrevUrlQuery] = useState("");

  const urlQuery = searchParams.get("query") ?? "";
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    const ownQuery = buildGmailQuery(filters);
    if (urlQuery && urlQuery !== ownQuery) {
      setFilters((prev) => ({ ...prev, keyword: urlQuery }));
      setDebouncedFilters((prev) => ({ ...prev, keyword: urlQuery }));
    }
  }

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

  const hadOwnQueryRef = useRef(false);

  useEffect(() => {
    const currentQ = searchParams.get("query") ?? "";

    if (gmailQuery) {
      hadOwnQueryRef.current = true;
      if (gmailQuery !== currentQ) {
        router.replace(`?query=${encodeURIComponent(gmailQuery)}`, {
          scroll: false,
        });
      }
    } else if (hadOwnQueryRef.current && currentQ) {
      hadOwnQueryRef.current = false;
      router.replace("?");
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
