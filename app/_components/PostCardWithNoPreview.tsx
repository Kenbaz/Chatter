"use client";

import { FC, useState, useEffect } from "react";
import { PostData } from "@/src/libs/contentServices";
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

interface PostCardProps {
  post: PostData;
  authorId: string;
}

const PostCardWithNoPreview: FC<PostCardProps> = ({ post, authorId }) => {
  const { user } = useRequireAuth();
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [authorData, setAuthorData] = useState<Partial<UserData> | null>(null);
  const [commentCount, setCommentCount] = useState(post.comments.length);
  const [showProfileHover, setShowProfileHover] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowDropdown, setShouldShowDropdown] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorProfilePicture, setAuthorProfilePicture] = useState("");

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


  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    setTimeout(() => {
      target.style.color = "rgba(15, 118, 110, 0.5)";
      target.style.opacity = '50px';
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
    <div className="post-card bg-primary mb-2 h-auto pb-4 p-2 md:pl-5 md:pr-5 md:rounded-md">
      <div className="profile-picture-container">
        <div className="flex items-center mt-2 gap-2">
          <div
            className="w-[30px] h-[30px] rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
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
          <Link href={`/profile/${authorId}`}>
            <small
              className="text-[14px] cursor-pointer hover:text-white"
              onClick={handleClick}
              style={{ position: "relative" }}
            >
              {authorName}
            </small>
          </Link>
        </div>

        {showProfileHover && shouldShowDropdown && authorData && (
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
        )}
      </div>
      <Link href={`/post/${post.id}`}>
        <h1
          className="text-xl font-bold mt-2 text-customWhite hover:text-gray-300 mb-2 md:pl-8"
          onClick={handleClick}
          style={{ position: "relative" }}
        >
          {post.title}
        </h1>
      </Link>
      <small className="flex gap-2 text-sm md:pl-8">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="py-1 px-2 font-light rounded-md hover:bg-gray-700">
              <span className="text-gray-400">#</span>
              {tag}
            </span>
          </Link>
        ))}
      </small>
    </div>
  );
};

export default PostCardWithNoPreview;
