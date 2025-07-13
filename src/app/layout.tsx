import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClientSessionProvider } from "~/components/session-provider";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "Clearity",
  description: "EVE Online corporation management tool",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ClientSessionProvider>{children}</ClientSessionProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
