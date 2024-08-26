"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { Profile } from "@/src/libs/userServices";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Link from "next/link";

const MyInterests: FC = () => {
    const { getUserInterests } = Profile();
    const { user } = useRequireAuth();
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
       return <div className="text-sm text-white">Loading interests...</div>;
    }
    
    return (
      <div>
        {interests.length > 0 ? (
          <ul className=" mb-6 lg:relative lg:left-4">
            {error && <p className="text-[14px] text-red-600">{error}</p>}
            {interests.map((interest, index) => (
              <Link key={index} href={`/tag/${encodeURIComponent(interest)}`}>
                <li className="mb-2 tracking-wide hover:text-white">
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
}

export default MyInterests;