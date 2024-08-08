import { FC, useState, useEffect } from 'react';
import { PostData, likeFuncs } from '@/src/libs/contentServices';
import BookmarkButton from './BookmarkButton';
import Markdown from 'react-markdown';
import { useRequireAuth } from '@/src/libs/useRequireAuth';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/src/libs/firebase';

interface PostCardProps {
  post: PostData;
  authorId: string;
}

const PostCard: FC<PostCardProps> = ({ post, authorId }) => {
  const { user } = useRequireAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid || ""));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const { likePost, unlikePost } = likeFuncs();
  const [showProfileHover, setShowProfileHover] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authorProfilePicture, setAuthorProfilePicture] = useState(
    ""
  );

  useEffect(() => {
    const fetchAuthorName = async () => {
      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(firestore, "Users", authorId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAuthorName(userData.fullname || "Anonymous");
          setAuthorProfilePicture(userData.profilePictureUrl)
        } else {
          setAuthorName("Anonymous");
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching author info:", error);
        setAuthorName("Anonymous");
        setIsLoading(false)
      }
    };

    fetchAuthorName();
  }, [authorId]);

  const handleLike = async () => {
    if (!user) return;
    try {
      if (isLiked) {
        await unlikePost(user.uid, post.id);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(user.uid, post.id);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  if (!user) return;

  return (
    <div className="post-card">
      <div
        className="profile-picture-container"
        onMouseEnter={() => setShowProfileHover(true)}
        onMouseLeave={() => setShowProfileHover(false)}
      >
        <div className="w-[40px] h-[40px] rounded-[50%] overflow-hidden flex justify-center items-center">
          {isLoading ? (
            <div>...</div>
          ) : (
            <Image
              src={authorProfilePicture || "/images/default-profile-image-2.jpg"}
              alt="Author's profile picture"
              width={40}
                height={40}
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>

        {showProfileHover && (
          <div className="profile-hover absolute bg-white shadow-md p-2 rounded">
            <Link href={`/profile/${authorId}`}>
              <button className="bg-blue-500 text-white px-2 py-1 rounded">
                View Profile
              </button>
            </Link>
          </div>
        )}
      </div>
      <small className="text-[14px]">{authorName}</small>
      <Link href={`/post/${post.id}`}>
        <h1 className="text-xl font-bold mb-2">{post.title}</h1>
      </Link>
      <div className="post-tags">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="tag">{tag}</span>
          </Link>
        ))}
      </div>
      <div>
        <Markdown>{`${post.content.substring(0, 130)}....`}</Markdown>
      </div>
      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`like-button ${isLiked ? "liked" : ""}`}
        >
          {isLiked ? "❤️" : "🤍"} {likeCount}
        </button>
        <BookmarkButton postId={post.id} userId={user.uid} />
      </div>
    </div>
  );
};

export default PostCard;