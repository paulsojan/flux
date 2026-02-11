"use client";

import { ComposeEmail } from "@/components/ComposeEmail";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateEmailApi } from "@/hooks/tanstack/useEmailsApi";

export default function ComposePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: createEmail, isPending } = useCreateEmailApi();

  const handleSend = (to: string, subject: string, body: string) => {
    const payload = { to, subject, body };

    createEmail(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["send-emails"] });
        router.push("/sent");
      },
    });
  };

  const handleCancel = () => {
    router.push("/inbox");
  };

  return (
    <ComposeEmail
      onSend={handleSend}
      onCancel={handleCancel}
      isPending={isPending}
    />
  );
}
