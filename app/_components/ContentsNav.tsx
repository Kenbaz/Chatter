"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";


const ContentsNavigation: FC = () => {
 const pathname = usePathname();
 const searchParams = useSearchParams();
  const feedType = searchParams.get("feedType");

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };
  
  return (
    <nav>
      <ul className="flex space-x-4">
        <li className="hover:text-teal-800 px-2 py-2 hover:bg-customWhite3 rounded-lg dark:px-0 dark:py-0 dark:hover:bg-opacity-0">
          <Link
            href={`${pathname}?${createQueryString("feedType", "forYou")}`}
            className={
              feedType === "forYou"
                ? "font-bold dark:text-white text-customBlack"
                : "font-medium"
            }
          >
            For You
          </Link>
        </li>
        <li className="hover:text-teal-800 px-2 py-2 hover:bg-customWhite3 rounded-lg dark:px-0 dark:py-0 dark:hover:bg-opacity-0">
          <Link
            href={`${pathname}?${createQueryString("feedType", "following")}`}
            className={
              feedType === "following"
                ? "font-bold dark:text-white text-customBlack"
                : "font-medium"
            }
          >
            Following
          </Link>
        </li>
        <li className="hover:text-teal-800 px-2 py-2 hover:bg-customWhite3 rounded-lg dark:px-0 dark:py-0 dark:hover:bg-opacity-0">
          <Link
            href={`${pathname}?${createQueryString("feedType", "latest")}`}
            className={
              feedType === "latest"
                ? "font-bold dark:text-white text-customBlack"
                : "font-medium"
            }
          >
            Latest
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default ContentsNavigation;
