"use client";

import { FC, useState, useEffect} from "react";
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

    const limitedComments = comments.slice(0, 2);

  if (!user) return;

  return (
    <div className="post-card bg-primary mb-2 p-2">
      <div
        className="profile-picture-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center mt-2 gap-2">
          <div className="w-[30px] h-[30px] rounded-[50%] border-2 border-teal-700 cursor-pointer overflow-hidden flex justify-center items-center">
            {isLoading ? (
              <div>...</div>
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
        <h1 className="text-xl font-bold mt-2 text-white hover:text-gray-300 mb-2">
          {post.title}
        </h1>
      </Link>
      <small className="flex gap-2 text-sm ">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="p-1 font-light rounded-lg hover:bg-gray-700">
              <span className="text-teal-700">#</span>
              {tag}
            </span>
          </Link>
        ))}
      </small>
      <div className="mt-2 mb-3">
        <Markdown>{`${post.content.substring(0, 130)}....`}</Markdown>
      </div>
      <div className="post-actions items-center flex gap-10">
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
      {comments.length > 0 && (
        <div className="comments-preview mt-4">
          {limitedComments.map((comment) => (
            <div
              key={comment.id}
              className="comment flex gap-3 mb-2 p-2 rounded"
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
              <div className="bg-customGray p-[10px] rounded-lg">
                <small className="text-customWhite">{comment.author}</small>
                <p className="text-sm mt-2 text-white">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCardWithComments;