"use client";

import { EmailSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type EmailListProps = {
  emails: EmailSummary[];
  title: string;
  onSelectEmail: (emailId: string) => void;
  loading?: boolean;
  toolbar?: React.ReactNode;
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function EmailList({
  emails,
  title,
  onSelectEmail,
  loading,
  toolbar,
}: EmailListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b px-6 py-4">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {toolbar}

      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              {i !== 4 && <Separator />}
            </div>
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No emails to display.
        </div>
      ) : (
        <div>
          {emails.map((email, index) => (
            <div key={email.id}>
              <Button
                variant="ghost"
                onClick={() => onSelectEmail(email.id)}
                className="w-full justify-start px-6 py-4 h-auto rounded-none cursor-pointer"
              >
                <div className="w-full text-left space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-sm truncate max-w-xs">
                      {email.from}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {formatDate(email.date)}
                    </span>
                  </div>

                  <div className="text-sm font-medium truncate">
                    {email.subject}
                  </div>

                  <div className="text-xs text-muted-foreground truncate">
                    {email.snippet}
                  </div>
                </div>
              </Button>

              {index !== emails.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
