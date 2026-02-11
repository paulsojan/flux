"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailList } from "@/components/EmailList";
import { EmailFilterBar } from "@/components/EmailFilterBar";
import { Button } from "@/components/ui/button";
import { useFetchSendEmailsApi } from "@/hooks/tanstack/useEmailsApi";

export default function SentPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchSendEmailsApi(query);

  const allEmails = useMemo(
    () => data?.pages.flatMap((p) => p.emails) ?? [],
    [data?.pages],
  );

  return (
    <div className="flex flex-col w-full">
      <EmailList
        emails={allEmails}
        title="Sent"
        onSelectEmail={(emailId) => router.push(`/sent/${emailId}`)}
        loading={isLoading}
        toolbar={
          <EmailFilterBar hasActiveFilters={!!query} showReadStatus={false} />
        }
      />

      {hasNextPage && (
        <div className="mt-4 mb-5 flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            className="cursor-pointer"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
