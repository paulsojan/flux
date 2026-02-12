"use client";

import { Sidebar } from "@/components/Sidebar";
import { AuthGate } from "@/components/AuthGate";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useFetchAuthStatusApi } from "@/hooks/tanstack/useAuthApi";
import { SIDEBAR_CONFIG } from "@/app/constants";
import { useEmailStream } from "@/hooks/useEmailStream";
import { useAgentTools } from "@/hooks/useAgentTools";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCoAgent } from "@copilotkit/react-core";
import { AgentState } from "@/lib/types";

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { setState } = useCoAgent<AgentState>({ name: "ai_mail_agent" });

  const { data, isLoading } = useFetchAuthStatusApi();
  const authenticated = data?.authenticated ?? false;

  useEmailStream();
  useAgentTools();

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      current_view: pathname,
    }));
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="h-screen flex">
        <Sidebar />
        <AuthGate />
      </div>
    );
  }

  return (
    <CopilotSidebar {...SIDEBAR_CONFIG}>
      <div className="h-screen flex">
        <Sidebar />
        {children}
      </div>
    </CopilotSidebar>
  );
}
