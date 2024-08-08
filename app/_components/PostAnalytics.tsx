"use client";

import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { analyticsFuncs } from "@/src/libs/contentServices";
import { Profile } from "@/src/libs/userServices";
import { useRequireAuth } from "@/src/libs/useRequireAuth";

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
  }>;
}

const PostAnalytics: FC<PostAnalyticsProps> = ({ postId, isAuthor }) => {
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const { getPostAnalytics, trackView } = analyticsFuncs();
  const { getUserProfile } = Profile();
  const { user } = useRequireAuth();

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await getPostAnalytics(postId, isAuthor);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching post analytics:", error);
    }
  }, [postId, isAuthor, getPostAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderedAnalytics = useMemo(() => {
    if (!analytics) return <div>Loading analytics...</div>;

    return (
      <div className="detailed-post-analytics">
        <h1>Post Analytics</h1>
        <p>Views: {analytics.views}</p>
        <p>Likes: {analytics.likes}</p>
        <p>Comments: {analytics.comments}</p>
        <p>Bookmarks: {analytics.bookmarks}</p>

        {isAuthor && (
          <>
            <h4>Likes</h4>
            {analytics?.likeDetails ? (
              <ul>
                {analytics.likeDetails.length > 0 ? (
                  analytics.likeDetails.map((like) => (
                    <li key={like.userId}>
                      {like.fullname} (@{like.username})
                    </li>
                  ))
                ) : (
                  <li>No likes yet</li>
                )}
              </ul>
            ) : (
              <p>...</p>
            )}

            <h4>Comments</h4>
            {analytics?.commentDetails ? (
              <ul>
                {analytics.commentDetails.length > 0 ? (
                  analytics.commentDetails.map((comment) => (
                    <li key={comment.userId}>
                      {comment.fullname} (@{comment.username})
                    </li>
                  ))
                ) : (
                  <li>No comments yet</li>
                )}
              </ul>
            ) : (
              <p>...</p>
            )}

            <h4>Bookmarks</h4>
            {analytics?.bookmarkDetails ? (
              <ul>
                {analytics.bookmarkDetails.length > 0 ? (
                  analytics.bookmarkDetails.map((bookmark) => (
                    <li key={bookmark.userId}>
                      {bookmark.fullname} (@{bookmark.username})
                    </li>
                  ))
                ) : (
                  <li>No bookmarks yet</li>
                )}
              </ul>
            ) : (
              <p>...</p>
            )}
          </>
        )}
      </div>
    );
  }, [analytics, isAuthor]);

  return renderedAnalytics;
};

export default PostAnalytics;
