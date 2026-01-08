import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { PrivacyProvider } from "@/context/PrivacyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Illyas Finance - Premium Tracker",
  description: "Modern Finance Tracker for professional wealth management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <PrivacyProvider>
              {children}
              <Chatbot />
            </PrivacyProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
