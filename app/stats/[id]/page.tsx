"use client";

import { useParams } from "next/navigation";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import PostAnalytics from "@/app/_components/PostAnalytics";
import { postFuncs } from "@/src/libs/contentServices";
import { useEffect, useState } from "react";

const PostAnalyticsPage = () => {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useRequireAuth();
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getPostById } = postFuncs();

  useEffect(() => {
    const checkAuthor = async () => {
      if (id && user) {
        try {
          const post = await getPostById(id);
          setIsAuthor(post?.authorId === user.uid);
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    };

    checkAuthor();
  }, [id, user, authLoading, getPostById]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  if (!id) {
    return <div>Invalid post ID</div>;
  }

  return (
    <div>
      <PostAnalytics postId={id} isAuthor={isAuthor} />
    </div>
  );
};

export default PostAnalyticsPage;
