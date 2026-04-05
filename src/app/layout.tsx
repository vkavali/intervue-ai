import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import DemoFloatingToolbar from "@/components/test-mode/DemoFloatingToolbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "printf - AI-Controlled Interview Platform",
  description:
    "The AI-controlled interview platform where AI assistance is deliberately controlled by the company and every session is automatically audited, scored, and summarized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FAFAF8] text-gray-900`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <DemoFloatingToolbar />
        </AuthProvider>
      </body>
    </html>
  );
}
