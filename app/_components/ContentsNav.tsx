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
        <li>
          <Link
            href={`${pathname}?${createQueryString("feedType", "forYou")}`}
            className={feedType === "forYou" ? "font-bold" : ""}
          >
            For You
          </Link>
        </li>
        <li>
          <Link
            href={`${pathname}?${createQueryString("feedType", "following")}`}
            className={feedType === "following" ? "font-bold" : ""}
          >
            Following
          </Link>
        </li>
        <li>
          <Link
            href={`${pathname}?${createQueryString("feedType", "latest")}`}
            className={feedType === "latest" ? "font-bold" : ""}
          >
            Latest
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default ContentsNavigation;
