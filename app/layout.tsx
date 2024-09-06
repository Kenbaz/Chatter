import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github.css";
import { Providers } from "./_components/Providers";
import ClientInitWrapper from "./_components/ClientInitWrapper";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatter",
  description: "A dev community for creating and reading contents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-y-hidden`}>
        <Providers>
          <ThemeProvider attribute="class">
            <ClientInitWrapper>{children}</ClientInitWrapper>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
