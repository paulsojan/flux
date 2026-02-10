"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { EmailList } from "@/components/EmailList";
import { Button } from "@/components/ui/button";
import { useFetchSendEmailsApi } from "@/hooks/tanstack/useEmailsApi";

export default function SentPage() {
  const router = useRouter();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchSendEmailsApi();

  const allEmails = useMemo(
    () => data?.pages.flatMap((p) => p.emails) ?? [],
    [data?.pages],
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <EmailList
        emails={allEmails}
        title="Sent"
        onSelectEmail={(emailId) => router.push(`/sent/${emailId}`)}
        loading={isLoading}
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
