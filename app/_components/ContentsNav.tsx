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
        <li className="hover:text-teal-800">
          <Link
            href={`${pathname}?${createQueryString("feedType", "forYou")}`}
            className={
              feedType === "forYou" ? "font-bold text-white" : "font-light"
            }
          >
            For You
          </Link>
        </li>
        <li className="hover:text-teal-800">
          <Link
            href={`${pathname}?${createQueryString("feedType", "following")}`}
            className={
              feedType === "following" ? "font-bold text-white" : "font-light"
            }
          >
            Following
          </Link>
        </li>
        <li className="hover:text-teal-700">
          <Link
            href={`${pathname}?${createQueryString("feedType", "latest")}`}
            className={
              feedType === "latest" ? "font-bold text-white" : "font-light"
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
