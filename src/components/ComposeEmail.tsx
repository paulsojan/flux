"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  const searchParams = useSearchParams();

  const [email, setEmail] = useState({
    to: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    const to = searchParams.get("to") ?? "";
    const subject = searchParams.get("subject") ?? "";
    const body = searchParams.get("body") ?? "";

    setEmail({ to, subject, body });
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(email.to, email.subject, email.body);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b px-6 py-4">
        <h1 className="text-xl font-semibold">New Message</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="email"
            placeholder="recipient@example.com"
            value={email.to}
            onChange={(e) => setEmail({ ...email, to: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            type="text"
            placeholder="Subject"
            value={email.subject}
            onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            placeholder="Write your message..."
            rows={12}
            value={email.body}
            onChange={(e) => setEmail({ ...email, body: e.target.value })}
            required
            className="resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="cursor-pointer" disabled={isPending}>
            {isPending ? "Sending..." : "Send"}
          </Button>

          <Button
            type="button"
            className="cursor-pointer"
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
