import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import { Navbar } from "@/components/navbar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { inter, oswald } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "Synapse - Knowledge Engine",
  description: "A minimal, powerful knowledge engine that connects your documents, conversations, and code in one intelligent interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProviderWrapper
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Navbar />
          <FloatingNavbar />
          <Toaster />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
