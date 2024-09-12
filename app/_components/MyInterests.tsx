"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { Profile } from "@/src/libs/userServices";
// import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Link from "next/link";
import { useAuthentication } from "./AuthContext";

const MyInterests: FC = () => {
  const { getUserInterests } = Profile();
  const { user } = useAuthentication();
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterests = useCallback(async () => {
    if (user) {
      try {
        const interests = await getUserInterests(user.uid);
        setInterests(interests);
      } catch (error) {
        console.error("Error getting interests:", error);
        setError("Failed to load interests");
      } finally {
        setLoading(false);
      }
    }
  }, [user, getUserInterests]);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  if (loading) {
    return <div className="text-sm dark:text-white">Loading interests...</div>;
  }

  return (
    <div>
      {interests.length > 0 ? (
        <ul className=" mb-6 lg:relative lg:left-4">
          {error && <p className="text-[14px] text-red-600">{error}</p>}
          {interests.map((interest, index) => (
            <Link key={index} href={`/tag/${encodeURIComponent(interest)}`}>
              <li className="mb-2 tracking-wide px-2 py-[0.40rem] hover:rounded-md dark:hover:text-white hover:text-customBlack dark:hover:bg-teal-900 hover:underline hover:bg-customWhite3 hover:opacity-65 transition-colors duration-200">
                #{interest}
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p className="mb-6">No interests found. Add some to your profile!</p>
      )}
    </div>
  );
};

export default MyInterests;
