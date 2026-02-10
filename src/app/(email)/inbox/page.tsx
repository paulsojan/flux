"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailList } from "@/components/EmailList";
import { EmailFilterBar } from "@/components/EmailFilterBar";
import { Button } from "@/components/ui/button";
import { useFetchInboxEmailsApi } from "@/hooks/tanstack/useEmailsApi";
import { useEmailFilters } from "@/hooks/useEmailFilters";

export default function InboxPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const { filters, clearFilters, updateFilter } = useEmailFilters();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchInboxEmailsApi(query);

  const allEmails = useMemo(
    () => data?.pages.flatMap((p) => p.emails) ?? [],
    [data?.pages],
  );

  return (
    <div className="flex flex-col w-full">
      <EmailList
        emails={allEmails}
        title="Inbox"
        loading={isLoading}
        onSelectEmail={(id) => router.push(`/inbox/${id}`)}
        toolbar={
          <EmailFilterBar
            filters={filters}
            onUpdateFilter={updateFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={!!query}
          />
        }
      />

      {hasNextPage && (
        <div className="mt-4 mb-5 flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
