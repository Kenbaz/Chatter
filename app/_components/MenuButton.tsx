"use client";

import { useState, useEffect, useRef, FC } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Profile } from "@/src/libs/userServices";
import { useAuth } from "@/src/libs/authServices";
import { FaBookmark, FaPlus } from "react-icons/fa6";
import { useAuthentication } from "./AuthContext";

interface UserProfileData {
  username: string;
  fullname: string;
  bio: string;
  profilePictureUrl: string;
  interests: string[];
  languages: string[];
  location: string;
  website_url: string;
  socialLinks: {
    twitter: string;
    linkedIn: string;
    github: string;
  };
  education: string;
}

const MenuButton: FC = () => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { getUserProfile } = Profile();
  const { user } = useAuthentication();
  const { signOutUser } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const userProfileData = await getUserProfile(user.uid);
        setProfileData(userProfileData as UserProfileData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, getUserProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreatePostNavigation = () => {
    router.push("/create-post");
  };

  if (!user || !profileData) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-teal-800 hover:border-teal-800 hover:border-3 border-3 border-teal-700 cursor-pointer w-[40px] h-[40px] rounded-[50%] overflow-hidden flex justify-center items-center"
      >
        <Image
          src={
            profileData.profilePictureUrl ||
            "/images/default-profile-image-2.jpg"
          }
          alt="menu"
          width={40}
          height={40}
          style={{ objectFit: "cover" }}
        />
      </div>
      {isOpen && (
        <div className="absolute -right-[29px] mt-2 border dark:border-customGray1 w-[90vw] dark:bg-primary bg-customWhite3 rounded-md shadow-md py-1 transition-all duration-300 ease-out md:w-[30vw] md:right-[13px] md:top-[42px] lg:w-[25vw] 2xl:w-[17vw]">
          <div
            onClick={() => router.push(`/profile/${user.uid}`)}
            className=" border border-t-0 border-r-0 border-l-0 dark:border-customGray1"
          >
            <div className="px-2 mb-1 flex items-center gap-2 md:gap-3 rounded-lg cursor-pointer py-4 text-base dark:text-tinWhite hover:bg-gray-100 dark:hover:text-gray-800 w-[95%] m-auto text-left">
              <span className="w-[30px] h-[30px] rounded-[50%] overflow-hidden flex justify-center items-center border-2 border-teal-700">
                <Image
                  src={
                    profileData.profilePictureUrl ||
                    "/images/default-profile-image-2.jpg"
                  }
                  alt="menu avatar"
                  width={30}
                  height={30}
                  style={{ objectFit: "cover" }}
                />
              </span>
              <span>{profileData.fullname}</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/reading-list")}
            className="px-2 mb-1 flex items-center gap-2 md:gap-3 rounded-lg cursor-pointer py-4 text-base dark:text-tinWhite hover:bg-gray-100 dark:hover:text-gray-800 w-[95%] m-auto text-left mt-1"
          >
            <span>
              <FaBookmark />
            </span>
            <span>Reading List</span>
          </button>
          <button
            className="px-2 mb-1 flex items-center gap-2 md:gap-3 rounded-lg cursor-pointer py-4 text-base dark:text-tinWhite hover:bg-gray-100 dark:hover:text-gray-800 w-[95%] m-auto text-left"
            onClick={handleCreatePostNavigation}
          >
            <span>
              <FaPlus />
            </span>
            <span>Create Post</span>
          </button>
          <button
            onClick={signOutUser}
            className=" border border-b-0 border-r-0 border-l-0 w-full text-tinWhite dark:border-customGray1"
          >
            <div className="block px-4 py-4 text-center text-base m-auto rounded-lg dark:text-tinWhite text-customBlack hover:bg-gray-100 dark:hover:text-gray-800 w-[95%] mt-1 ">
              Sign Out
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuButton;
