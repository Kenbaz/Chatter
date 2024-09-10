"use client";

import { FC, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PostData } from "@/src/libs/contentServices";
import Markdown from "react-markdown";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Image from "next/image";
import Link from "next/link";
import { FaComment } from "react-icons/fa6";
import { analyticsFuncs } from "@/src/libs/contentServices";
import ProfileHoverDropdown from "./ProfileHoverDropdown";
import {
  Profile,
  ImplementFollowersFuncs,
  UserData,
} from "@/src/libs/userServices";
import BookmarkBtn from "./BookmarkBtn2";
import { MessageCircle, Heart } from 'lucide-react';
import { likeFuncs } from "@/src/libs/contentServices";
import { FaHeart } from "react-icons/fa";

interface PostCardProps {
  post: PostData;
  authorId: string;
}


const PostCardWithComments: FC<PostCardProps> = ({ post, authorId }) => {
  const { user } = useRequireAuth();
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [authorData, setAuthorData] = useState<Partial<UserData> | null>(null);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [showProfileHover, setShowProfileHover] = useState(false);
    const [authorName, setAuthorName] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowDropdown, setShouldShowDropdown] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorProfilePicture, setAuthorProfilePicture] = useState("");
  const [isClicked, setIsClicked] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  
  const router = useRouter();

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
    fetchPostAnalytics();
  }, [authorId, user]);


   const handleIconClick = (event: React.MouseEvent) => {
     event.preventDefault();
     setIsClicked(true);
     setTimeout(() => {
       setIsClicked(false);
       router.push(`/post/${post.id}`);
     }, 500);
   };


 const handleMouseEnter = () => {
   isHoveringRef.current = true;
   if (timeoutRef.current) clearTimeout(timeoutRef.current);
   timeoutRef.current = setTimeout(() => {
     if (isHoveringRef.current) {
       setShowProfileHover(true);
     }
   }, 500); // 500ms delay before showing the dropdown
 };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    setTimeout(() => {
      target.style.color = "rgba(15, 118, 110, 0.5)";
      target.style.opacity = '50px'
    }, 150);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setShowProfileHover(false);
      }
    }, 300); // 300ms delay before hiding the dropdown
  };
  
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (
         hoverRef.current &&
         !hoverRef.current.contains(event.target as Node)
       ) {
         setShowProfileHover(false);
       }
     };

     document.addEventListener("mousedown", handleClickOutside);
     return () => {
       document.removeEventListener("mousedown", handleClickOutside);
       if (timeoutRef.current) clearTimeout(timeoutRef.current);
     };
   }, []);

    const limitedComments = comments.slice(0, 2);

  if (!user) return;

  return (
    <div
      className={`post-card dark:bg-primary bg-customWhite3 mb-2 px-3 py-2 h-auto md:pl-4 md:pr-4 rounded-l-md lg:rounded-md xl:pr-10 transition-all duration-300 ${
        isClicked
          ? "md:border-2 md:border-teal-700 md:shadow-lg"
          : "md:border-2 md:border-transparent"
      }`}
    >
      <div className="flex items-center mt-2 gap-2">
        <div
          ref={hoverRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-[50%] border-2 border-teal-700 cursor-pointer overflow-hidden flex justify-center items-center">
              {isLoading ? (
                <Image
                  src="/images/default-profile-image-2.jpg"
                  alt="Avatar"
                  width={30}
                  height={30}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Image
                  src={
                    authorProfilePicture ||
                    "/images/default-profile-image-2.jpg"
                  }
                  alt="Avatar"
                  width={30}
                  height={30}
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
            <Link href={`/profile/${authorId}`}>
              <small
                className="text-[14px] dark:hover:text-white hover:text-customBlack"
                onClick={handleClick}
                style={{ position: "relative" }}
              >
                {authorName}
              </small>
            </Link>
          </div>

          {showProfileHover && authorData && (
            <div
              className="absolute left-0 mt-2 z-10"
              onMouseEnter={() => {
                isHoveringRef.current = true;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <ProfileHoverDropdown
                authorData={authorData}
                isCurrentUser={isCurrentUser}
                isFollowing={isFollowing}
                onFollow={async () => {
                  await followUser(user.uid, authorId);
                  setIsFollowing(true);
                }}
                onUnfollow={async () => {
                  await unfollowUser(user.uid, authorId);
                  setIsFollowing(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Link href={`/post/${post.id}`}>
        <h1
          className="text-xl font-bold mt-2 dark:text-white dark:hover:text-gray-300 hover:text-gray-700 mb-2 md:pl-8"
          onClick={handleClick}
          style={{ position: "relative" }}
        >
          {post.title}
        </h1>
      </Link>
      <small className="flex gap-2 text-sm md:pl-8">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="py-1 px-2 dark:font-light rounded-md dark:hover:bg-customGray1 dark:text-gray-400 text-gray-800 hover:bg-customWhite2 dark:hover:text-white hover:text-customBlack transition-colors duration-200">
              <span className="text-gray-500 dark:text-gray-400">#</span>
              {tag}
            </span>
          </Link>
        ))}
      </small>
      <div className="mt-2 mb-3 md:pl-8">
        <Markdown>{`${post.content.substring(0, 130)}....`}</Markdown>
      </div>
      <div className="post-actions relative items-center flex gap-5 md:pl-8">
        {likeCount > 0 && (
          <button
            className="text-sm py-1 px-2 rounded-md dark:font-light flex items-center gap-2 dark:hover:bg-customGray1 hover:bg-customWhite2 hover:opacity-90 transition-colors duration-200 dark:hover:text-white hover:text-customBlack"
            onClick={handleIconClick}
          >
            <span className=" rounded-lg flex items-center gap-1">
              <FaHeart size={18} className="text-red-600" />
              Likes
            </span>
            <span>{likeCount}</span>
          </button>
        )}

        {commentCount > 0 && (
          <span
            className="comment-button cursor-pointer rounded-md flex gap-2 items-center text-sm dark:font-light py-1 px-2 relative dark:hover:bg-customGray1 hover:bg-customWhite2 hover:opacity-90 transition-colors duration-200 hover:text-customBlack dark:hover:text-white"
            onClick={handleIconClick}
          >
            <span className=" flex items-center gap-1">
              <MessageCircle size={18} />
              Comments
            </span>{" "}
            <span>{commentCount}</span>
          </span>
        )}
        <div className="absolute z-10 right-0">
          <BookmarkBtn postId={post.id} userId={user.uid} />
        </div>
      </div>
      {comments.length > 0 && (
        <div className="comments-preview mt-4">
          {limitedComments.map((comment) => (
            <div
              key={comment.id}
              className="comment flex gap-3 mb-2 p-2 rounded "
            >
              <div>
                <div className="w-[20px] h-[20px] border border-teal-700 rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center">
                  <Image
                    src={
                      comment.profilePicture ||
                      "/images/default-profile-image-2.jpg"
                    }
                    alt="avatar"
                    width={20}
                    height={20}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              <Link href={`/post/${post.id}?scrollTo=${comment.id}`}>
                <div className="dark:bg-customGray bg-customWhite2 p-[10px] rounded-lg cursor-pointer dark:hover:bg-customGray1 border hover:bg-customGray3 dark:border-customGray transition-colors duration-200">
                  <small className="dark:text-customWhite">{comment.author}</small>
                  <p className="text-sm mt-2 dark:text-white">{comment.content}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCardWithComments;
