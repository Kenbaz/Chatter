"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { Profile } from "@/src/libs/userServices";
import { useAuthentication } from "./AuthContext";

const MyLanguages: FC = () => {
  const { getUserLanguages } = Profile();
  const { user } = useAuthentication();
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    if (user) {
      try {
        const interests = await getUserLanguages(user.uid);
        setLanguages(interests);
      } catch (error) {
        console.error("Error getting interests:", error);
        setError("Failed to load interests");
      } finally {
        setLoading(false);
      }
    }
  }, [user, getUserLanguages]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  if (loading) {
    return <div className="dark:text-white text-[14px]">Loading languages...</div>;
  }

  return (
    <div className="dark:bg-primary bg-customWhite3">
      {languages.length > 0 ? (
        <ul className=" mb-6">
          {error && <p className="text-[14px] text-red-600">{error}</p>}
          {languages.map((languages, index) => (
            <li key={index} className="mb-2 tracking-wide">
              {languages}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6">No languages found. Add some to your profile!</p>
      )}
    </div>
  );
};

export default MyLanguages;
