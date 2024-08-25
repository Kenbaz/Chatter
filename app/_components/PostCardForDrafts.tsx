"use client";

import { FC, useState, useEffect } from "react";
import { PostData } from "@/src/libs/contentServices";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Image from "next/image";
import Link from "next/link";
import { analyticsFuncs } from "@/src/libs/contentServices";
import {
  Profile,
  ImplementFollowersFuncs,
  UserData,
} from "@/src/libs/userServices";

interface PostCardProps {
  post: PostData;
  authorId: string;
}

const PostCardForDrafts: FC<PostCardProps> = ({ post, authorId }) => {
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
    <div className="post-card bg-primary mb-2 h-auto pb-4 p-2 relative md:pl-4">
      <div
        className="profile-picture-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center mt-2 gap-2">
          <div className="w-[30px] h-[30px] rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center">
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
          <small className="text-[14px]">{authorName}</small>
        </div>
      </div>
      <Link href={`/post/${post.id}`}>
        <h1 className="text-xl font-bold mt-2 text-customWhite hover:text-gray-300 mb-2 md:pl-9">
          {post.title}
        </h1>
      </Link>
      <small className="flex gap-2 text-sm md:pl-8">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="p-1 font-light rounded-lg hover:bg-gray-700">
              <span className="text-gray-400">#</span>
              {tag}
            </span>
          </Link>
        ))}
      </small>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-20deg]">
        <p className="border-2 border-red-500 text-red-500 px-4 py-2 rounded-md text-xl font-bold opacity-70">
          Drafted Post
        </p>
      </div>
    </div>
  );
};

export default PostCardForDrafts;
