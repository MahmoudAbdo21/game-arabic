import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arabic Phonics",
  description: "Educational application",
};

import { VisualPreviewProvider } from "@/features/profile-selection/state/visual-preview-profile-store";
import { AudioProvider } from "@/providers/AudioProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AudioProvider>
          <VisualPreviewProvider>
            {children}
          </VisualPreviewProvider>
        </AudioProvider>
      </body>

    </html>
  );
}
