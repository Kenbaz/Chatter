import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "highlight.js/styles/github.css";
import { Providers } from "../_components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatter",
  description: "Page for post creation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className={`${inter.className} overflow-y-scroll h-screen`}>
        <header className="h-14 bg-headerColor"></header>
        <Providers>{children}</Providers>
      </div>
  );
}
