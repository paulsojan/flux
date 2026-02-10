import type { EmailFilters } from "./types";

export function buildGmailQuery(filters: EmailFilters): string {
  const parts: string[] = [];

  if (filters.keyword.trim()) {
    parts.push(filters.keyword.trim());
  }

  if (filters.readStatus === "unread") {
    parts.push("is:unread");
  } else if (filters.readStatus === "read") {
    parts.push("is:read");
  }

  return parts.join(" ");
}
