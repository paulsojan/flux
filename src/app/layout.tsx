import type { Metadata } from "next";

import "./globals.css";
import "@copilotkit/react-ui/styles.css";

import Providers from "./providers";

export const metadata: Metadata = {
  title: "AI Mail",
  description: "Gmail client with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
