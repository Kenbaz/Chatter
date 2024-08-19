"use client";

import { Inter } from "next/font/google";
import "highlight.js/styles/github.css";
import { Providers } from "../_components/Providers";
import SearchBar from "../_components/SearchBar2";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import MenuButton from "../_components/MenuButton";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleCreatePostNavigation = () => {
    router.push("/create-post");
  };

  return (
    <div className={`${inter.className} overflow-y-scroll h-screen`}>
      <header className="h-14 dark:bg-primary flex justify-around items-center fixed top-0 w-full border border-t-0 border-l-0 border-r-0 border-headerColor z-50">
        <Link href="/feeds">
          <div className="text-outline-teal p-1 -ml-16 text-black text-xl font-bold tracking-wide">
            Chatter
          </div>
        </Link>
        <div className="hidden md:block">
          <SearchBar />
        </div>
        <div className="md:flex hidden items-center gap-20">
          <button
            className="w-32 rounded-lg hidden md:block border text-center relative py-2"
            onClick={handleCreatePostNavigation}
          >
            <FaPlus className="absolute top-3 left-4" /> Create
          </button>
          <MenuButton />
        </div>
        <div className="md:hidden z-50 relative -right-10">
          <MenuButton />
        </div>
      </header>
      <Providers>{children}</Providers>
    </div>
  );
}
