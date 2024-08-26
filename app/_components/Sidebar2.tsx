"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { Profile } from "@/src/libs/userServices";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { useRouter } from "next/navigation";
import MyLanguages from "./MyLanguges";
import {
  FaInfoCircle,
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaBookmark,
  FaFacebook,
  FaInstagram,
  FaHome,
  FaTags,
} from "react-icons/fa";

const SideBar: FC = () => {
  const { getUserInterests } = Profile();
  const router = useRouter();
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

  const navigateToReadingList = () => {
    router.push("/reading-list");
  };

  const handleNavHome = () => {
    router.push("/feeds");
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  

    return (
      <>
        <div className="p-4 bg-primary w-11/12 m-auto rounded-md lg:mt-2 h-[20%] 2xl:px-0 2xl:w-[68%] 2xl:ml-0 xl:w-[75%] xl:ml-0 xl:mt-2">
          <div>
            <h3 className="text-white font-bold py-2 border border-t-0 border-l-0 border-r-0 border-headerColor xl:px-4">
              Discussions
            </h3>
          </div>
        </div>
        <div className="bg-primary mt-4 rounded-md p-4 w-11/12 m-auto 2xl:w-[68%] 2xl:ml-0 xl:w-[75%] xl:ml-0">
          <h2 className="font-bold mb-4 py-2 border border-t-0 border-l-0 border-r-0 border-headerColor">
            My Languages
          </h2>
          <MyLanguages />
        </div>
      </>
    );
};

export default SideBar;
