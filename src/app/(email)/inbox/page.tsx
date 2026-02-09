"use client";

import { EmailList } from "@/components/EmailList";
import { useRouter } from "next/navigation";
import { useFetchInboxEmailsApi } from "@/hooks/tanstack/useEmailsApi";

export default function InboxPage() {
  const router = useRouter();

  const { data, isLoading } = useFetchInboxEmailsApi();
  const emails = data?.emails ?? [];

  const handleSelectEmail = (emailId: string) =>
    router.push(`/email/${emailId}`);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <EmailList
      emails={emails}
      title="Inbox"
      onSelectEmail={handleSelectEmail}
      loading={isLoading}
    />
  );
}
