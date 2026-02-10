"use client";

import { EmailSummary } from "@/lib/types";

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
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {toolbar}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading emails...
        </div>
      ) : emails.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No emails to display.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-medium text-sm truncate max-w-xs">
                  {email.from}
                </span>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {formatDate(email.date)}
                </span>
              </div>
              <div className="text-sm font-medium truncate">
                {email.subject}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {email.snippet}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
