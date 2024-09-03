'use client';

import { FC, useState, useEffect } from 'react';
import { shareFuncs } from '@/src/libs/sharing';
import { FaCopy } from 'react-icons/fa';

interface ShareButtonsProps {
  postId: string;
  postTitle: string;
    coverImageUrl: string;
}

const ShareButtons: FC<ShareButtonsProps> = ({ postId, postTitle, coverImageUrl }) => {
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
          className="dark:text-white flex items-center p-2 justify-between w-full hover:dark:bg-teal-800 rounded-md hover:opacity-50 font-semibold tracking-wide"
          onClick={() => copyLinkToClipboard(postId)}
        >
          <span>{copyButtonText}</span>
          <span>
            <FaCopy />
          </span>
        </button>
        <button
          className="tracking-wide p-2 rounded-md hover:bg-teal-800 hover:opacity-50 text-start w-full"
          onClick={() => shareOnTwitter(postId, postTitle)}
        >
          Share on Twitter
        </button>
        <button
          className="tracking-wide p-2 rounded-md hover:bg-teal-800 hover:opacity-50 text-start w-full"
          onClick={() => shareOnLinkedIn(postId)}
        >
          Share on LinkedIn
        </button>
      </div>
    );
};

export default ShareButtons;