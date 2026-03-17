import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "RepoBrain — AI-Powered GitHub Repository Analyser",
  description:
    "Chat with any GitHub repository using AI. RepoBrain indexes every function, class, and file — then lets you ask questions with cited answers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <Sidebar />
          <main
            className="min-h-screen"
            style={{
              paddingTop: "var(--rb-navbar-height)",
              paddingLeft: "var(--rb-sidebar-width)",
            }}
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
