"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useComposeStore } from "@/store/composeStore";

type ComposeEmailProps = {
  onSend: (to: string, subject: string, body: string) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
};

export function ComposeEmail({
  onSend,
  onCancel,
  isPending,
}: ComposeEmailProps) {
  const [email, setEmail] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const { email: storeEmail, clearEmail } = useComposeStore();

  useEffect(() => {
    if (storeEmail) {
      setEmail(storeEmail);
      clearEmail();
    }
  }, [storeEmail, clearEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(email.to, email.subject, email.body);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <div className="sticky top-0 bg-background border-b px-6 py-4 shrink-0">
        <h1 className="text-xl font-semibold">New Message</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col gap-6 p-6 min-h-0 overflow-hidden"
      >
        <div className="space-y-2 shrink-0">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="email"
            value={email.to}
            onChange={(e) => setEmail({ ...email, to: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 shrink-0">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            type="text"
            value={email.subject}
            onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            required
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Label htmlFor="body" className="shrink-0">
            Message
          </Label>

          <Textarea
            id="body"
            value={email.body}
            onChange={(e) => setEmail({ ...email, body: e.target.value })}
            required
            className="flex-1 min-h-0 resize-none overflow-y-auto mt-2"
          />
        </div>

        <div className="flex gap-3 shrink-0">
          <Button type="submit" className="cursor-pointer" disabled={isPending}>
            {isPending ? "Sending..." : "Send"}
          </Button>
          <Button
            className="cursor-pointer"
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
