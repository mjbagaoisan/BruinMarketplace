import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";


const mulish = Mulish({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-mulish',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "Bruin Marketplace",
  description: "The official marketplace for UCLA students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mulish.className}>
      <body className="font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
