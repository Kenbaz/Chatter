import { FC } from 'react';
import { shareFuncs } from '@/src/libs/sharing';

interface ShareButtonsProps {
  postId: string;
  postTitle: string;
    coverImageUrl: string;
}

const ShareButtons: FC<ShareButtonsProps> = ({ postId, postTitle, coverImageUrl }) => {
    const { copyLinkToClipboard, shareOnLinkedIn, shareOnTwitter } = shareFuncs();

    return (
        <div className="share-buttons w-full border">
            <button onClick={() => copyLinkToClipboard(postId)}>Copy Link</button>
            <button onClick={() => shareOnTwitter(postId, postTitle, coverImageUrl)}>
                Share on Twitter
            </button>
            <button onClick={() => shareOnLinkedIn(postId, coverImageUrl)}>
                Share on LinkedIn
            </button>
        </div>
    );
};

export default ShareButtons;