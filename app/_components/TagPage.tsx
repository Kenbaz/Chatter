"use client";

import { useEffect, useState, FC, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { tagFuncs, PostData } from "@/src/libs/contentServices";
import PostCardWithNoPreview from "./PostCardWithNoPreview";
import { setLoading } from "../_store/loadingSlice";
import { clearError, setError } from "../_store/errorSlice";
import { RootState } from "../_store/store";
import { useInView } from "react-intersection-observer";
import TagPageSkeleton from "./skeletons/TagsPageSkeleton";
import { Loader2 } from "lucide-react";

const TagPage: FC = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { getPostsByTag } = tagFuncs();

  const { error } = useSelector((state: RootState) => state.error);
  const { isLoading } = useSelector((state: RootState) => state.loading);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const loadMorePosts = useCallback(async () => {
    if (!params.tagName || !hasMore) return;

    dispatch(setLoading(true));
    try {
      const lastPostId =
        posts.length > 0 ? posts[posts.length - 1].id : undefined;
      const newPosts = await getPostsByTag(
        params.tagName as string,
        10,
        lastPostId
      );

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => {
          const uniqueNewPosts = newPosts.filter(
            (newPost) =>
              !prevPosts.some((existingPost) => existingPost.id === newPost.id)
          );
          return [...prevPosts, ...uniqueNewPosts];
        });
      }
      dispatch(clearError());
    } catch (error) {
      dispatch(setError("Error fetching posts. Please try again"));
      console.error("Failed to fetch posts by tag:", error);
    } finally {
      dispatch(setLoading(false));
      setInitialLoadComplete(true);
    }
  }, [params.tagName, posts, hasMore, getPostsByTag, dispatch]);

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    setInitialLoadComplete(false);
    loadMorePosts();
  }, [params.tagName]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadMorePosts();
    }
  }, [inView, loadMorePosts, isLoading]);

  return (
    <div className="tag-page border border-red-800 h-auto bg-headerColor pb-10 mt-14 md:w-[70%] md:m-auto md:mt-14 lg:w-[60%] 2xl:w-[50%]">
      <h1 className="text-xl font-bold md:text-2xl tracking-wide p-2 text-center text-teal-700">
        #{params.tagName}
      </h1>
      {!initialLoadComplete ? (
        <div>
          <TagPageSkeleton />
        </div>
      ) : posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <PostCardWithNoPreview
              key={post.id}
              post={post}
              authorId={post.authorId}
            />
          ))}
          {hasMore && (
            <div ref={ref}>
              {isLoading && (
                <Loader2 size={20} className="animate-spin ml-[46%] md:ml-[50%] text-customWhite" />
              )}
            </div>
          )}
        </>
      ) : (
        <p>No posts found with this tag.</p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!hasMore && <p className="text-center mt-2">No more posts</p>}
    </div>
  );
};

export default TagPage;
