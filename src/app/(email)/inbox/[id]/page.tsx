"use client";

import { useEffect } from "react";
import { EmailDetailView } from "@/components/EmailDetail";
import { useRouter, useParams } from "next/navigation";
import { useFetchEmailApi } from "@/hooks/tanstack/useEmailsApi";
import { useCoAgent } from "@copilotkit/react-core";
import { AgentState } from "@/lib/types";

export default function InboxEmailDetailPage() {
  const router = useRouter();

  const params = useParams();
  const emailId = params?.id as string;

  const { data: email, isLoading } = useFetchEmailApi(emailId);
  const { setState } = useCoAgent<AgentState>({ name: "my_agent" });

  useEffect(() => {
    if (email) {
      setState((prev) => ({
        emails: prev?.emails ?? [],
        sent_emails: prev?.sent_emails ?? [],
        current_email: email,
        current_view: "detail" as const,
      }));
    }
  }, [email]);

  if (isLoading || !email) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/inbox");
  };

  return <EmailDetailView email={email} onBack={handleBack} />;
}
