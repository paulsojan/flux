"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";
import { queryClient } from "@/utils/queryClient";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CopilotKit runtimeUrl="/api/copilotkit" agent="ai_mail_agent">
        {children}
      </CopilotKit>
    </QueryClientProvider>
  );
}
