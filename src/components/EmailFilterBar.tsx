"use client";

import type { EmailFilters } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

type EmailFilterBarProps = {
  filters: EmailFilters;
  onUpdateFilter: <K extends keyof EmailFilters>(
    key: K,
    value: EmailFilters[K],
  ) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  showReadStatus?: boolean;
};

export function EmailFilterBar({
  filters,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters,
  showReadStatus = true,
}: EmailFilterBarProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-45 max-w-60">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={filters.keyword}
            onChange={(e) => onUpdateFilter("keyword", e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        {showReadStatus && (
          <Select
            value={filters.readStatus}
            onValueChange={(value) =>
              onUpdateFilter("readStatus", value as EmailFilters["readStatus"])
            }
          >
            <SelectTrigger className="w-32.5 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
