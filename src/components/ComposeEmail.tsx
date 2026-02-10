"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type ComposeEmailProps = {
  onSend: (to: string, subject: string, body: string) => Promise<void>;
  onCancel: () => void;
};

export function ComposeEmail({ onSend, onCancel }: ComposeEmailProps) {
  const searchParams = useSearchParams();
  const [sending, setSending] = useState(false);

  const [email, setEmail] = useState({
    to: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    const to = searchParams.get("to") ?? "";
    const subject = searchParams.get("subject") ?? "";
    const body = searchParams.get("body") ?? "";
    if (to || subject || body) {
      setEmail({ to, subject, body });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await onSend(email.to, email.subject, email.body);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold">New Message</h1>
      </div>
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            type="email"
            value={email.to}
            onChange={(e) => setEmail({ ...email, to: e.target.value })}
            placeholder="recipient@example.com"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            value={email.subject}
            onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            placeholder="Subject"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={email.body}
            onChange={(e) => setEmail({ ...email, body: e.target.value })}
            placeholder="Write your message..."
            rows={12}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sending}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {sending ? "Sending..." : "Send"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
