"use client";

import { useState, useEffect, FC } from "react";
import { useParams } from "next/navigation";
import { Profile } from "@/src/libs/userServices";
import { setLoading } from "../_store/loadingSlice";
import { setError, clearError } from "../_store/errorSlice";
import { postFuncs, PostData } from "@/src/libs/contentServices";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import Image from "next/image";
import Link from "next/link";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import PostCard from "./PostCard";
import { ImplementFollowersFuncs } from "@/src/libs/userServices";

interface UserProfileData {
  username: string;
  fullname: string;
  bio: string;
  profilePictureUrl: string;
  interests: string[];
  work: string;
  languages: string[];
  location: string;
  website_url: string;
  socialLinks: {
    twitter: string;
    linkedIn: string;
    github: string;
  };
  education: string;
}

const ProfilePage: FC = () => {
  const { user } = useRequireAuth();
  const { getUserProfile } = Profile();
  const params = useParams();
  const { error } = useSelector((state: RootState) => state.error);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const { getPostsByAuthor } = postFuncs();
  const { followUser, unfollowUser, isFollowingUser } =
    ImplementFollowersFuncs();

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && params.userId) {
        const following = await isFollowingUser(
          user.uid,
          params.userId as string
        );
        setIsFollowing(following);
        setIsOwnProfile(user.uid === params.userId);
      }
    };
    checkFollowStatus();
  }, [user, params.userId]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (params.userId) {
        try {
          dispatch(setLoading(true));
          const userProfileData = await getUserProfile(params.userId as string);
          setProfileData(userProfileData as UserProfileData);

          //Fetch posts
          const posts = await getPostsByAuthor(params.userId as string);
          if (posts.length < 5) {
            setHasMorePosts(false);
          }
          setUserPosts(posts);
          dispatch(clearError());
        } catch (error) {
          dispatch(setError("Failed to load user profile"));
          console.error(error);
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        console.log("No userId in params");
      }
    };

    fetchUserProfile();
  }, [params.userId]);

  const handleFollow = async () => {
    if (!user || !params.userId) return;
    try {
      if (user.uid === params.userId) return;

      if (isFollowing) {
        await unfollowUser(user.uid, params.userId as string);
      } else {
        await followUser(user.uid, params.userId as string);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || !params.userId) return;

    try {
      const newPosts = await getPostsByAuthor(
        params.userId as string,
        5,
        lastPostId
      );
      if (newPosts.length < 5) {
        setHasMorePosts(false);
      }

      setUserPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setLastPostId(newPosts[newPosts.length - 1]?.id || null);
      dispatch(clearError());
    } catch (error) {
      dispatch(setError("Failed to load more posts"));
      console.error("Failed to load more posts:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!profileData) return <div>User not found</div>;

  const isCurrentUser = user && user.uid === params.userId;

  return (
    <div className="user-profile-page">
      {error && <p className="text-red-600">{error}</p>}

      <div className="profile-header">
        {!isOwnProfile && (
          <button onClick={handleFollow} className="follow-btn">
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
        <div className="w-[120px] h-[120px] rounded-[50%] overflow-hidden flex justify-center items-center">
          <Image
            src={
              profileData.profilePictureUrl ||
              "/images/default-profile-image-2.jpg"
            }
            alt={`${profileData.username}'s profile picture`}
            width={120}
            height={120}
            style={{ objectFit: "cover" }}
          />
        </div>

        <h1>{profileData.fullname}</h1>
        <small>@{profileData.username}</small>
        <p>{profileData.bio}</p>
        <p>{profileData.location}</p>
        <p>{profileData.work}</p>
        {isCurrentUser && (
          <Link href="/profile/edit">
            <button>Edit Profile</button>
          </Link>
        )}
      </div>

      <div className="user-posts">
        {userPosts.length > 0 ? (
          userPosts.map((post, index) => (
            <PostCard
              key={`${post.id}_${index}`}
              post={post}
              authorId={post.authorId}
            />
          ))
        ) : (
          <p>No post published yet.</p>
        )}
        {hasMorePosts && (
          <button onClick={loadMorePosts}>Load More Posts</button>
        )}
      </div>

      <div className="profile-details">
        <section>
          <h3>Interests</h3>
          <ul>
            {profileData.interests &&
              profileData.interests.map((interest, index) => (
                <li key={index}>{interest}</li>
              ))}
          </ul>
        </section>

        <section>
          <h3>Skills/Languages</h3>
          <ul>
            {profileData.languages &&
              profileData.languages.map((language, index) => (
                <li key={index}>{language}</li>
              ))}
          </ul>
        </section>

        <section>
          <h3>Education</h3>
          <p>{profileData.education}</p>
        </section>
      </div>

      <div className="social-links">
        <h3>Connect with {profileData.fullname}</h3>
        {profileData.socialLinks && profileData.socialLinks.twitter && (
          <Link href={profileData.socialLinks.twitter} target="_blank">
            Twitter
          </Link>
        )}
        {profileData.socialLinks && profileData.socialLinks.linkedIn && (
          <Link href={profileData.socialLinks.linkedIn} target="_blank">
            LinkedIn
          </Link>
        )}
        {profileData.socialLinks && profileData.socialLinks.github && (
          <Link href={profileData.socialLinks.github} target="_blank">
            GitHub
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
