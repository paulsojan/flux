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
import { useEmailFilters } from "@/hooks/useEmailFilters";

type EmailFilterBarProps = {
  hasActiveFilters: boolean;
  showReadStatus?: boolean;
};

export function EmailFilterBar({
  hasActiveFilters,
  showReadStatus = true,
}: EmailFilterBarProps) {
  const { filters, clearFilters, updateFilter } = useEmailFilters();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-45 max-w-60">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={filters.keyword}
            onChange={(e) => updateFilter("keyword", e.target.value)}
            className="pl-8 h-9 cursor-pointer"
          />
        </div>

        {showReadStatus && (
          <Select
            value={filters.readStatus}
            onValueChange={(value) =>
              updateFilter("readStatus", value as EmailFilters["readStatus"])
            }
          >
            <SelectTrigger className="w-32.5 h-9 cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={clearFilters}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
