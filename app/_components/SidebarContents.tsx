'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import MyInterests from './MyInterests';
import { FaInfoCircle, FaTwitter, FaGithub, FaLinkedin, FaBookmark, FaFacebook, FaInstagram, FaHome, FaTags } from 'react-icons/fa';

const SideBarContent: FC = () => {
    const router = useRouter();

    const navigateToReadingList = () => {
      router.push("/reading-list");
    };

    const handleNavHome = () => {
        router.push("/feeds");
    }

    
    return (
      <div className="p-4 xl:w-[70%] xl:ml-[7rem]">
        <div className="space-y-2 -mt-1 mb-7 lg:relative lg:left-4">
          <button
            onClick={handleNavHome}
            className="flex items-center space-x-2 w-full p-2 rounded cursor-pointer hover:bg-teal-900 hover:opacity-85 hover:text-white transition-colors duration-200"
          >
            <FaHome className="text-orange-300" />
            <span>Home</span>
          </button>

          <button className="flex items-center space-x-2 w-full p-2 rounded hover:bg-teal-900 hover:text-white hover:opacity-85 transition-colors duration-200">
            <FaInfoCircle className="text-purple-500" />
            <span>About</span>
          </button>

          <button className="flex items-center space-x-2 w-full p-2 rounded hover:bg-teal-900 hover:text-white hover:opacity-85 transition-colors duration-200">
            <FaTags className="text-gold4" />
            <span>Tags</span>
          </button>

          <button
            onClick={navigateToReadingList}
            className="flex items-center justify-between w-full p-2 text-white rounded cursor-pointer hover:bg-teal-900 hover:text-white hover:opacity-85 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <FaBookmark className="text-blue-800" />
              <span>Reading List</span>
            </div>
          </button>

          <div className="flex items-center text-xl">
            <button className="flex items-center w-full p-1 text-white rounded">
              <FaTwitter />
            </button>

            <button className="flex items-center w-full p-1 text-white rounded">
              <FaLinkedin />
            </button>

            <button className="flex items-center w-full p-1 text-white rounded">
              <FaGithub />
            </button>
            <button className="flex items-center w-full p-1 text-white rounded">
              <FaFacebook />
            </button>
            <button className="flex items-center w-full p-1 text-white rounded">
              <FaInstagram />
            </button>
          </div>
        </div>
        <h2 className="font-bold mb-4 lg:relative lg:left-4">My Interests</h2>
        <MyInterests />
      </div>
    );
};

export default SideBarContent;