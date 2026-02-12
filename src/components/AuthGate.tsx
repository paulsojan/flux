"use client";

import { API_BASE } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function AuthGate() {
  const queryClient = useQueryClient();

  const handleLogin = () => {
    const popup = window.open(
      `${API_BASE}auth/login`,
      "gmail-auth",
      "width=500,height=700,popup=yes",
    );

    const interval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(interval);
        queryClient.invalidateQueries({ queryKey: ["auth-status"] });
      }
    }, 500);
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Sign in to Gmail</h2>
          <p className="text-muted-foreground">
            Connect your Google account to manage your emails with AI
            assistance.
          </p>
        </div>

        <Button onClick={handleLogin} size="lg" className="px-6 cursor-pointer">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
