import { FC, useState } from 'react';
import { PostData, likeFuncs } from '@/src/libs/contentServices';
import BookmarkButton from './BookmarkButton';
import Markdown from 'react-markdown';
import { useRequireAuth } from '@/src/libs/useRequireAuth';
import Link from 'next/link';

interface PostCardProps {
  post: PostData;
}

const PostCard: FC<PostCardProps> = ({ post }: {post: PostData}) => {
  const { user } = useRequireAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid || ""));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const { likePost, unlikePost } = likeFuncs();

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

  return (
    <div className="post-card">
      <Link href={`/post/${post.id}`}>
        <h1 className='text-xl font-bold mb-2'>{post.title}</h1>
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
        <BookmarkButton postId={post.id} />
      </div>
    </div>
  );
};

export default PostCard;