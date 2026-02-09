"use client";

import { EmailDetailView } from "@/components/EmailDetail";
import { useRouter, useParams } from "next/navigation";
import { useFetchEmailApi } from "@/hooks/tanstack/useEmailsApi";

export default function EmailDetailPage() {
  const router = useRouter();

  const params = useParams();
  const emailId = params?.id as string;

  const { data: email, isLoading } = useFetchEmailApi(emailId);

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
