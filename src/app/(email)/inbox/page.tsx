"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { EmailList } from "@/components/EmailList";
import { Button } from "@/components/ui/button";
import { useFetchInboxEmailsApi } from "@/hooks/tanstack/useEmailsApi";

export default function InboxPage() {
  const router = useRouter();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchInboxEmailsApi();

  const allEmails = useMemo(
    () => data?.pages.flatMap((p) => p.emails) ?? [],
    [data?.pages],
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <EmailList
        emails={allEmails}
        title="Inbox"
        onSelectEmail={(id) => router.push(`/inbox/${id}`)}
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
