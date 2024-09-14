"use client";

import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { analyticsFuncs, postFuncs, PostData } from "@/src/libs/contentServices";
import { Profile } from "@/src/libs/userServices";
import Image from "next/image";
import AnalyticsSkeleton from "./skeletons/AnalyticsSkeleton";
import { useAuthentication } from "./AuthContext";

interface PostAnalyticsProps {
  postId: string;
  isAuthor: boolean;
}

interface DetailedAnalytics {
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  likeDetails?: Array<{
    userId: string | undefined;
    username: string;
    fullname: string;
    profilePicture: string;
  }>;
  commentDetails?: Array<{
    userId: string | undefined;
    username: string;
    fullname: string;
  }>;
  bookmarkDetails?: Array<{
    userId: string | undefined;
    username: string;
    fullname: string;
    profilePicture: string;
  }>;
}

const PostAnalytics: FC<PostAnalyticsProps> = ({ postId, isAuthor }) => {
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [posts, setPosts] = useState<PostData | null>(null);
  const { getPostAnalytics } = analyticsFuncs();
  const { getPostById } = postFuncs();
  const { getUserProfile } = Profile();
  const { user } = useAuthentication();

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await getPostAnalytics(postId, isAuthor);
      setAnalytics(data);
      const postData = await getPostById(postId);
      setPosts(postData)
    } catch (error) {
      console.error("Error fetching post analytics:", error);
    }
  }, [postId, isAuthor, getPostAnalytics, getPostById]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderedAnalytics = useMemo(() => {
    if (!analytics) return <AnalyticsSkeleton/>;

    return (
      <div className="detailed-post-analytic mt-14 pb-16 p-2 gap-2 grid place-items-center md:w-[80%] md:m-auto md:mt-14 2xl:w-[55%]">
        {posts && (
          <h1 className="text-center font-bold text-2xl text-teal-700 p-2">
            {posts.title}
          </h1>
        )}
        <div className="grid place-items-center dark:bg-primary bg-customWhite3 w-full p-2 pb-4 dark:text-white rounded-md">
          <p className="tracking-wide">Readers</p>
          <p className="font-bold text-2xl">{analytics.views}</p>
        </div>
        <div className="grid place-items-center dark:bg-primary bg-customWhite3 w-full p-2 pb-4 dark:text-white rounded-md">
          <p className="tracking-wide">Likes</p>
          <p className="font-bold text-2xl">{analytics.likes}</p>
        </div>
        <div className="grid place-items-center dark:bg-primary bg-customWhite3 w-full p-2 pb-4 dark:text-white rounded-md">
          <p className="tracking-wide">Comments</p>
          <p className="font-bold text-2xl">{analytics.comments}</p>
        </div>
        <div className="grid place-items-center dark:bg-primary bg-customWhite3 w-full p-2 pb-4 dark:text-white rounded-md">
          <p className="tracking-wide">Bookmarks</p>
          <p className="font-bold text-2xl">{analytics.bookmarks}</p>
        </div>

        {isAuthor && (
          <div className="w-full mt-2">
            <div className="dark:bg-primary bg-customWhite3 pb-3 rounded-md w-full">
              <h4 className="text-xl tracking-wide font-semibold p-2">
                Like History
              </h4>
              {analytics?.likeDetails ? (
                <div className="like-history-container max-h-60 overflow-y-auto">
                  <ul className="space-y-2 p-2">
                    {analytics.likeDetails.length > 0 ? (
                      analytics.likeDetails.map((like) => (
                        <li
                          key={like.userId}
                          className="flex items-center gap-2"
                        >
                          <div className="w-[30px] h-[30px] rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center">
                            <Image
                              src={like.profilePicture}
                              alt="Avatar"
                              width={30}
                              height={30}
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          {like.fullname}
                        </li>
                      ))
                    ) : (
                      <li>No likes yet</li>
                    )}
                  </ul>
                </div>
              ) : (
                <p>...</p>
              )}
            </div>
            <div className="dark:bg-primary bg-customWhite3 pb-3 mt-3 rounded-md w-full">
              <h4 className="text-xl tracking-wide font-semibold p-2">
                Bookmark History
              </h4>
              {analytics?.bookmarkDetails ? (
                <div className="like-history-container max-h-60 overflow-y-auto">
                  <ul className="space-y-2 p-2">
                    {analytics.bookmarkDetails.length > 0 ? (
                      analytics.bookmarkDetails.map((bookmark) => (
                        <li
                          key={bookmark.userId}
                          className="flex items-center gap-2"
                        >
                          <div className="w-[30px] h-[30px] rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center">
                            <Image
                              src={bookmark.profilePicture}
                              alt="Avatar"
                              width={30}
                              height={30}
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          {bookmark.fullname}
                        </li>
                      ))
                    ) : (
                      <li>No bookmarks yet</li>
                    )}
                  </ul>
                </div>
              ) : (
                <p>...</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [analytics, isAuthor]);

  return renderedAnalytics;
};

export default PostAnalytics;
