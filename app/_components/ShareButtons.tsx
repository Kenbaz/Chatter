'use client';

import { FC, useState, useEffect } from 'react';
import { shareFuncs } from '@/src/libs/sharing';
import { FaCopy } from 'react-icons/fa';

interface ShareButtonsProps {
  postId: string;
  postTitle: string;
  postAuthor: string;
}

const ShareButtons: FC<ShareButtonsProps> = ({ postId, postTitle, postAuthor }) => {
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");

    const { shareOnLinkedIn, shareOnTwitter } = shareFuncs();

     const copyLinkToClipboard = (postId: string) => {
       try {
         const postUrl = `${window.location.origin}/post/${postId}`;
         navigator.clipboard.writeText(postUrl);
           setCopyButtonText("Copied to Clipboard!");
         console.log("Link copied to clipboard");
       } catch (error) {
         console.error("Failed to copy link: ", error);
       }
  };
  
  useEffect(() => {
    if (copyButtonText !== "Copy Link") {
      const timer = setTimeout(() => {
        setCopyButtonText("Copy Link");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copyButtonText]);

    return (
      <div className="share-buttons flex flex-col w-full gap-2 h-full">
        <button
          className="dark:text-white flex items-center p-2 justify-between w-full dark:hover:bg-teal-800 hover:bg-customGray3 rounded-md font-semibold tracking-wide"
          onClick={() => copyLinkToClipboard(postId)}
        >
          <span>{copyButtonText}</span>
          <span>
            <FaCopy />
          </span>
        </button>
        <button
          className="tracking-wide p-2 rounded-md dark:hover:bg-teal-800 hover:bg-customGray3 hover:text-black hover:font-medium text-start w-full"
          onClick={() => shareOnTwitter(postId, postTitle, postAuthor)}
        >
          Share on Twitter
        </button>
        <button
          className="tracking-wide p-2 rounded-md dark:hover:bg-teal-800 hover:bg-customGray3 hover:text-black hover:font-medium text-start w-full"
          onClick={() => shareOnLinkedIn(postId, postTitle)}
        >
          Share on LinkedIn
        </button>
      </div>
    );
};

export default ShareButtons;