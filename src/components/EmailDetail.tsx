"use client";

import { EmailDetail as EmailDetailType } from "@/lib/types";

type EmailDetailProps = {
  email: EmailDetailType;
  onBack: () => void;
};

export function EmailDetailView({ email, onBack }: EmailDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Back
        </button>
      </div>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold mb-4">{email.subject}</h1>
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-medium text-sm">{email.from}</span>
          <span className="text-xs text-gray-500">{email.date}</span>
        </div>
        <div className="text-xs text-gray-500 mb-6">To: {email.to}</div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {email.body}
        </div>
      </div>
    </div>
  );
}
