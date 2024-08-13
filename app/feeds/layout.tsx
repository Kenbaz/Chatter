"use client";

import { Inter } from "next/font/google";
import "highlight.js/styles/github.css";
import { Providers } from "../_components/Providers";
import SearchBar from "../_components/SearchBar";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import MenuButton from "../_components/MenuButton";
import { FaSearch } from "react-icons/fa";

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
      <header className="h-14 hidden bg-primary md:flex justify-around items-center">
        <div className="text-outline-teal p-1 text-black text-xl font-bold tracking-wide">
          Chatter
        </div>
        <div className="border p-2 md:hidden hover:bg-teal-500 opacity-80 rounded-lg">
          <FaSearch className="text-2xl font-light md:hidden" />
        </div>

        <div className="hidden md:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-20">
          <button
              className="w-32 rounded-lg border text-center relative py-2"
              onClick={handleCreatePostNavigation}
            >
              <FaPlus className="absolute top-3 left-4" /> Create
            </button>
           <MenuButton />
        </div>
      </header>
      <Providers>{children}</Providers>
    </div>
  );
}
