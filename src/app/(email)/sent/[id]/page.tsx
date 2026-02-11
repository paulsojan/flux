"use client";

import { useEffect } from "react";
import { EmailDetailView } from "@/components/EmailDetail";
import { useRouter, useParams } from "next/navigation";
import { useFetchEmailApi } from "@/hooks/tanstack/useEmailsApi";
import { useCoAgent } from "@copilotkit/react-core";
import { AgentState } from "@/lib/types";

export default function SentEmailDetailPage() {
  const router = useRouter();

  const params = useParams();
  const emailId = params?.id as string;

  const { data: email, isLoading } = useFetchEmailApi(emailId);
  const { setState } = useCoAgent<AgentState>({ name: "ai_mail_agent" });

  useEffect(() => {
    if (email) {
      setState(() => ({
        current_email: email,
        current_view: "sent_detail" as const,
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
    router.push("/sent");
  };

  return <EmailDetailView email={email} onBack={handleBack} />;
}
