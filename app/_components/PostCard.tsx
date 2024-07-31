import { FC } from 'react';
import { PostData } from '@/src/libs/contentServices';
import BookmarkButton from './BookmarkButton';
import Link from 'next/link';

interface PostCardProps {
  post: PostData;
}

const PostCard: FC<PostCardProps> = ({ post }: {post: PostData}) => {
  return (
    <div>
      <Link href={`/post/${post.id}`}>
        <div className="post-card">
          <h2>{post.title}</h2>
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                <span className="tag">{tag}</span>
              </Link>
            ))}
          </div>
          <p>{post.content.substring(0, 100)}...</p>
        </div>
      </Link>
      <BookmarkButton postId={post.id} />
    </div>
  );
};

export default PostCard;