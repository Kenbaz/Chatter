"use client";

import { useState, useEffect, FC, useCallback } from "react";
import { useParams } from "next/navigation";
import { Profile } from "@/src/libs/userServices";
import { setLoading } from "../_store/loadingSlice";
import { setError, clearError } from "../_store/errorSlice";
import { postFuncs, PostData } from "@/src/libs/contentServices";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import PostCardForDrafts from "./PostCardForDrafts";
import Image from "next/image";
import Link from "next/link";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import PostCard from "./PostCard";
import { ImplementFollowersFuncs } from "@/src/libs/userServices";
import { MdLocationOn } from "react-icons/md";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import PostCardWithNoPreview from "./PostCardWithNoPreview";


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
  const [draftedPosts, setDraftedPosts] = useState<PostData[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const { getPostsByAuthor, getDraftedPosts } = postFuncs();
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

  const fetchDraftedPosts = useCallback(async () => {
    if (!user) return;
    try {
      const draftPosts = await getDraftedPosts(user.uid);
      setDraftedPosts(draftPosts);
    } catch (error) {
      dispatch(setError("Failed to load drafted posts"));
      console.error("Error fetching drafted posts:", error);
    };
  }, [user]);

  useEffect(() => {
    fetchDraftedPosts()
  }, [fetchDraftedPosts]);

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

  const toggleMoreDetails = () => {
    setShowMoreDetails(!showMoreDetails);
  };

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
    <>
      <div className="user-profile-page mt-[70px] md:hidden h-auto pb-16 bg-primary">
        {error && <p className="text-red-600">{error}</p>}

        <div className="profile-header pb-4 p-2 mt-5 relative dark:bg-primary mb-4">
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className="follow-btn absolute right-4 py-1 px-3 rounded-md dark:bg-gray-200 dark:text-gray-900"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          {isCurrentUser && (
            <Link href="/profile/edit">
              <button className="absolute right-4 p-1 px-3 rounded-md dark:bg-gray-200 dark:text-gray-900">
                Edit Profile
              </button>
            </Link>
          )}
          <div className="flex items-center gap-3 pt-6">
            <div className="w-[100px] h-[100px] rounded-[50%] overflow-hidden flex justify-center items-center">
              <Image
                src={
                  profileData.profilePictureUrl ||
                  "/images/default-profile-image-2.jpg"
                }
                alt={`${profileData.username}'s profile picture`}
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div>
              {profileData.fullname && (
                <h1 className="font-bold text-xl tracking-wide">
                  {profileData.fullname}
                </h1>
              )}
              {profileData.username && <small>@{profileData.username}</small>}
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-3 dark:text-white">
            <div>
              {profileData.bio && (
                <p className="tracking-wide">{profileData.bio}</p>
              )}
            </div>
            <div className="flex items-center gap-1 border border-t-0 border-l-0 border-r-0 pb-4 dark:border-customGray1 text-gray-400">
              <MdLocationOn className="text-2xl text-gray-400" />
              <span>
                {profileData.location && <p>{profileData.location}</p>}
              </span>
            </div>
            <div>
              {profileData.education && (
                <div>
                  <h3 className="text-gray-400 text-[14px]">Education</h3>
                  <p className="tracking-wide">{profileData.education}</p>
                </div>
              )}
            </div>

            <button
              onClick={toggleMoreDetails}
              className="mt-4 px-4 py-2 border-2 dark:border-customGray1 text-white rounded-md transition-colors"
            >
              {showMoreDetails ? "Show Less" : "Show More"}
            </button>

            {showMoreDetails && (
              <>
                <div className="profile-details flex flex-col gap-3">
                  <div className="border border-t-0 border-l-0 border-r-0 border-customGray1 pb-2">
                    <h3 className="tracking-wide dark:text-gray-400">
                      Interests
                    </h3>
                    {profileData.interests &&
                    profileData.interests.length > 0 ? (
                      <p>{profileData.interests.join(", ")}</p>
                    ) : (
                      <p>No interests listed</p>
                    )}
                  </div>

                  <div className="border border-t-0 border-l-0 border-r-0 border-customGray1 pb-2">
                    <h3 className="tracking-wide text-gray-400">Work</h3>
                    {profileData.work ? (
                      <p>{profileData.work}</p>
                    ) : (
                      <p>No work listed</p>
                    )}
                  </div>

                  <div className="border border-t-0 border-l-0 border-r-0 border-customGray1 pb-2">
                    <h3 className="tracking-wide text-gray-400">
                      Skills/Languages
                    </h3>
                    {profileData.languages &&
                    profileData.languages.length > 0 ? (
                      <p>{profileData.languages.join(", ")}</p>
                    ) : (
                      <p>No languages listed</p>
                    )}
                  </div>
                </div>

                <div className="social-links">
                  <h3 className="mb-2">Connect with {profileData.fullname}</h3>
                  <div className="flex gap-4">
                    {profileData.socialLinks &&
                      profileData.socialLinks.twitter && (
                        <Link
                          href={profileData.socialLinks.twitter}
                          target="_blank"
                        >
                          <FaTwitter className="text-2xl" />
                        </Link>
                      )}
                    {profileData.socialLinks &&
                      profileData.socialLinks.linkedIn && (
                        <Link
                          href={profileData.socialLinks.linkedIn}
                          target="_blank"
                        >
                          <FaLinkedin className="text-2xl" />
                        </Link>
                      )}
                    {profileData.socialLinks &&
                      profileData.socialLinks.github && (
                        <Link
                          href={profileData.socialLinks.github}
                          target="_blank"
                        >
                          <FaGithub className="text-2xl" />
                        </Link>
                      )}
                  </div>
                </div>
              </>
            )}
          </div>
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

          {isOwnProfile &&
            draftedPosts &&
            draftedPosts.map((post, index) => (
              <>
                <PostCardForDrafts
                  key={`${index}-${post.id}`}
                  post={post}
                  authorId={post.authorId}
                />
              </>
            ))}
        </div>
      </div>

      <div className="user-profile-page mt-[70px] hidden md:block h-auto pb-16 md:w-[95%] md:m-auto md:mt-28 md:h-full lg:w-[92%] 2xl:w-[70%]">
        <div className="profile-header rounded-md pb-4 p-2 mt-5 relative dark:bg-primary mb-4 text-center">
          {error && <p className="text-red-600">{error}</p>}
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className="follow-btn absolute right-4 py-1 px-3 rounded-md dark:bg-gray-200 dark:text-gray-900"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          {isCurrentUser && (
            <Link href="/profile/edit">
              <button className="absolute right-4 p-1 px-3 rounded-md dark:bg-gray-200 dark:text-gray-900">
                Edit Profile
              </button>
            </Link>
          )}
          <div className=" pt-6">
            <div className="w-[100px] h-[100px] rounded-[50%] overflow-hidden flex justify-center items-center md:absolute md:-top-[50px] md:left-[45%] lg:left-[45%]">
              <Image
                src={
                  profileData.profilePictureUrl ||
                  "/images/default-profile-image-2.jpg"
                }
                alt={`${profileData.username}'s profile picture`}
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div>
              {profileData.fullname && (
                <h1 className="font-bold text-xl tracking-wide text-center mt-8 md:text-2xl">
                  {profileData.fullname}
                </h1>
              )}
              {profileData.username && (
                <small className="text-center">@{profileData.username}</small>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-3 dark:text-white">
            <div>
              {profileData.bio && (
                <p className="tracking-wide">{profileData.bio}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-1 border border-t-0 border-l-0 border-r-0 pb-4 dark:border-customGray1 text-gray-400 text-center">
                <MdLocationOn className="text-2xl text-center text-gray-400" />
              <span>
                {profileData.location && (
                  <p className="text-center">{profileData.location}</p>
                )}
              </span>
            </div>
            <div>
              {profileData.education && (
                <div>
                  <h3 className="text-gray-400 text-[14px]">Education</h3>
                  <p className="tracking-wide">{profileData.education}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="user-posts profile-grid">
          <div className="md:profile-details h-[650px]">
            <div className=" md:bg-primary rounded-md pl-4 pr-4 pt-2 pb-4">
              <h3 className="tracking-wide dark:text-gray-400 md:py-2 border border-t-0 border-l-0 border-r-0 border-headerColor md:dark:text-white md:font-semibold">
                Interests
              </h3>
              {profileData.interests && profileData.interests.length > 0 ? (
                <p className="md:pt-1">{profileData.interests.join(", ")}</p>
              ) : (
                <p className="md:pt-1">No interests listed</p>
              )}
            </div>

            <div className="md:bg-primary rounded-md pl-4 pr-4 pt-2 pb-4">
              <h3 className="tracking-wide text-gray-400 md:py-2 border border-t-0 border-l-0 border-r-0 border-headerColor md:dark:text-white md:font-semibold">
                Work
              </h3>
              {profileData.work ? (
                <p className="md:pt-1">{profileData.work}</p>
              ) : (
                <p className="md:pt-1">No work listed</p>
              )}
            </div>

            <div className="md:bg-primary rounded-md pl-4 pr-4 pt-2 pb-4">
              <h3 className="tracking-wide text-gray-400 md:py-2 border border-t-0 border-l-0 border-r-0 border-headerColor md:dark:text-white md:font-semibold">
                Skills/Languages
              </h3>
              {profileData.languages && profileData.languages.length > 0 ? (
                <p className="md:pt-1">{profileData.languages.join(", ")}</p>
              ) : (
                <p className="md:pt-1">No languages listed</p>
              )}
            </div>
            <div className="social-links md:bg-primary rounded-md pl-4 pt-2 pb-2">
              <h3 className="mb-2 md:py-2 border border-t-0 border-l-0 border-r-0 border-headerColor md:dark:text-white md:font-semibold md:pr-2">
                Connect with {profileData.fullname}
              </h3>
              <div className="flex gap-4 md:pt-2">
                {profileData.socialLinks && profileData.socialLinks.twitter && (
                  <Link href={profileData.socialLinks.twitter} target="_blank">
                    <FaTwitter className="text-2xl" />
                  </Link>
                )}
                {profileData.socialLinks &&
                  profileData.socialLinks.linkedIn && (
                    <Link
                      href={profileData.socialLinks.linkedIn}
                      target="_blank"
                    >
                      <FaLinkedin className="text-2xl" />
                    </Link>
                  )}
                {profileData.socialLinks && profileData.socialLinks.github && (
                  <Link href={profileData.socialLinks.github} target="_blank">
                    <FaGithub className="text-2xl" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="">
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

            {isOwnProfile &&
              draftedPosts &&
              draftedPosts.map((post, index) => (
                <>
                  <PostCardForDrafts
                    key={`${index}-${post.id}`}
                    post={post}
                    authorId={post.authorId}
                  />
                </>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
