"use client";

import { EmailDetail as EmailDetailType } from "@/lib/types";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type EmailDetailProps = {
  email: EmailDetailType;
  onBack: () => void;
};

export function EmailDetailView({ email, onBack }: EmailDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="px-4 cursor-pointer"
        >
          ← Back
        </Button>
      </div>

      <div className="px-6 py-6 space-y-6">
        <h1
          className="text-2xl font-semibold"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(email.subject),
          }}
        />

        <div className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">
              From: <span className="font-normal">{email.from}</span>
            </span>
            <span className="text-muted-foreground text-xs">{email.date}</span>
          </div>

          <div className="text-muted-foreground text-xs">To: {email.to}</div>
        </div>

        <Separator />

        <iframe
          title="email-body"
          className="w-full h-[75vh] border rounded-md"
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          srcDoc={DOMPurify.sanitize(email.body)}
        />
      </div>
    </div>
  );
}
