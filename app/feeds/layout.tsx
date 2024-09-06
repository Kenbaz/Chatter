"use client";

import { Inter } from "next/font/google";
import "highlight.js/styles/github.css";
import { Providers } from "../_components/Providers";
import SearchBar from "../_components/SearchBar";
import { useRouter } from "next/navigation";
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
    <div className={`${inter.className}`}>
      <header className="h-14 hidden md:flex md:fixed md:left-0 md:top-0 md:z-10 md:w-full md:border md:border-t-0 md:border-l-0 md:border-r-0 md:border-headerColor bg-primary md:py-2  justify-around items-center">
        <div className="text-outline-teal p-1 text-black text-xl font-bold tracking-wide md:text-2xl">
          Chatter
        </div>
        <div className="border p-2 md:hidden hover:bg-teal-500 opacity-80 rounded-lg">
          <FaSearch className="text-2xl font-light md:hidden" />
        </div>

        <div className="hidden md:block md:w-[50%]">
          <SearchBar />
        </div>

        <div className="flex items-center gap-20">
          <button
            className="w-32 rounded-lg border border-teal-900 text-teal-800 text-center relative py-2 font-semibold left-4"
            onClick={handleCreatePostNavigation}
          >
            Create
          </button>
          <div className="relative right-4">
            <MenuButton />
          </div>
        </div>
      </header>
      <Providers>{children}</Providers>
    </div>
  );
}
