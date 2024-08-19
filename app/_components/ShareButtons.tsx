'use client';

import { FC, useState } from 'react';
import { shareFuncs } from '@/src/libs/sharing';
import { FaCopy } from 'react-icons/fa';

interface ShareButtonsProps {
  postId: string;
  postTitle: string;
    coverImageUrl: string;
}

const ShareButtons: FC<ShareButtonsProps> = ({ postId, postTitle, coverImageUrl }) => {
    const [successMessage, setSuccessMessage] = useState("");

    const { shareOnLinkedIn, shareOnTwitter } = shareFuncs();

     const copyLinkToClipboard = (postId: string) => {
       try {
         const postUrl = `${window.location.origin}/post/${postId}`;
         navigator.clipboard.writeText(postUrl);
           setSuccessMessage('Copied to Clipboard');
         console.log("Link copied to clipboard");
       } catch (error) {
         console.error("Failed to copy link: ", error);
       }
     };

    return (
      <div className="share-buttons grid place-items-start w-full gap-2 h-full">
        <div className="flex items-center justify-between hover:dark:bg-teal-800 rounded-md hover:opacity-50 w-full h-full">
          <button
            className="dark:text-white font-semibold border h-full tracking-wide"
            onClick={() => copyLinkToClipboard(postId)}
          >
            <span> Copy Link</span>
            <span>
              <FaCopy />
            </span>
          </button>
        </div>
        {successMessage && (
          <div className=" px-4 py-1 rounded relative mb-2" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        <button
          className="tracking-wide hover:dark:bg-gray-200"
          onClick={() => shareOnTwitter(postId, postTitle, coverImageUrl)}
        >
          Share on Twitter
        </button>
        <button
          className="tracking-wide hover:dark:bg-gray-200"
          onClick={() => shareOnLinkedIn(postId, coverImageUrl)}
        >
          Share on LinkedIn
        </button>
      </div>
    );
};

export default ShareButtons;