"use client";

import { Inter } from "next/font/google";
import "highlight.js/styles/github.css";
import { Providers } from "../_components/Providers";
import SearchBar from "../_components/SearchBar";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import MenuButton from "../_components/MenuButton";

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
        <header className="h-14 bg-headerColor flex justify-around items-center">
          <SearchBar />
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
