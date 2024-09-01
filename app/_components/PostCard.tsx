'use client';

import { FC, useState, useEffect } from 'react';
import { PostData, likeFuncs } from '@/src/libs/contentServices';
import Markdown from 'react-markdown';
import { useRequireAuth } from '@/src/libs/useRequireAuth';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/src/libs/firebase';
import { FaComment } from 'react-icons/fa6';
import { analyticsFuncs } from '@/src/libs/contentServices';
import ProfileHoverDropdown from './ProfileHoverDropdown';
import { Profile, ImplementFollowersFuncs, UserData } from '@/src/libs/userServices';

interface PostCardProps {
  post: PostData;
  authorId: string;
}

const PostCard: FC<PostCardProps> = ({ post, authorId }) => {
  const { user } = useRequireAuth();
  const [likeCount, setLikeCount] = useState(post.likes.length);
   const [authorData, setAuthorData] = useState<Partial<UserData> | null>(null);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [showProfileHover, setShowProfileHover] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowDropdown, setShouldShowDropdown] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [publishedDate, setPublishedDate] = useState('');
  const [authorProfilePicture, setAuthorProfilePicture] = useState(
    ""
  );

  const { getPostAnalytics } = analyticsFuncs();
  const { getUserProfile } = Profile();
   const { followUser, unfollowUser, isFollowingUser } =
    ImplementFollowersFuncs();
  
  const isCurrentUser = user?.uid === authorId;

  useEffect(() => {
    const fetchAuthorData = async () => {
      setIsLoading(true);
      try {
        const userData = await getUserProfile(authorId);
        if (userData) {
          setAuthorData(userData);
          setAuthorName(userData.fullname || "Anonymous");
          setAuthorProfilePicture(
            userData.profilePictureUrl || "/images/default-profile-image-2.jpg"
          );
        } else {
          setAuthorName("Anonymous");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching author info:", error);
        setAuthorName("Anonymous");
        setIsLoading(false);
      }
    };

    const checkFollowStatus = async () => {
      if (user) {
        const following = await isFollowingUser(user.uid, authorId);
        setIsFollowing(following);
      }
    };

    const fetchPostAnalytics = async () => {
      try {
        const analytics = await getPostAnalytics(post.id);
        setLikeCount(analytics.likes);
        setCommentCount(analytics.comments);
      } catch (error) {
        console.error("Error fetching post analytics:", error);
      }
    };

    fetchAuthorData();
    checkFollowStatus();
    fetchPostAnalytics()
  }, [authorId, user]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    target.style.color = "rgba(15, 118, 110, 0.5)";
    setTimeout(() => {
      target.style.color = "";
    }, 150);
  };

  const handleMouseEnter = () => {
    setShowProfileHover(true);

    setTimeout(() => {
      setShouldShowDropdown(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    setShowProfileHover(false);
    setShouldShowDropdown(false);
  };


  if (!user) return;

  return (
    <div className="post-card bg-primary mb-2 h-auto pb-4 p-2 md:pl-4 md:rounded-md">
      <div className="profile-picture-container">
        <div className="flex items-center mt-2 gap-2">
          <div className="w-[30px] h-[30px] rounded-[50%] overflow-hidden flex justify-center items-center">
            {isLoading ? (
              <div>
                <Image
                  src={"/images/default-profile-image-2.jpg"}
                  alt="Avatar"
                  width={30}
                  height={30}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <Image
                src={
                  authorProfilePicture || "/images/default-profile-image-2.jpg"
                }
                alt="Avatar"
                width={30}
                height={30}
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <small
            className="text-[14px]"
            onClick={handleClick}
            style={{ position: "relative" }}
          >
            {authorName}
          </small>
        </div>
      </div>
      <Link href={`/post/${post.id}`}>
        <h1
          className="text-xl font-bold mt-2 text-customWhite hover:text-gray-300 mb-2 md:pl-9"
          onClick={handleClick}
          style={{ position: "relative" }}
        >
          {post.title}
        </h1>
      </Link>
      <small className="flex gap-2 text-sm md:pl-9 ">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="p-1 font-light rounded-lg hover:bg-gray-700">
              <span className="text-gray-400">#</span>
              {tag}
            </span>
          </Link>
        ))}
      </small>
      <div className="mt-2 mb-3 md:pl-9">
        <Markdown>{`${post.content.substring(0, 120)}....`}</Markdown>
      </div>
      <div className="post-actions items-center flex gap-10 md:pl-9">
        {likeCount > 0 && (
          <button className="text-sm p-1 rounded-lg font-light">
            <span className=" rounded-lg bg-gray-700">{"❤️"}</span> {likeCount}
          </button>
        )}

        {commentCount > 0 && (
          <span className="comment-button rounded-lg flex gap-2 items-center text-sm font-light relative">
            <span className="rounded-lg p-1 bg-gray-700">
              <FaComment />
            </span>{" "}
            <span>{commentCount}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default PostCard;