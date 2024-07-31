"use client";

import { useState, useEffect, FC } from "react";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { postFuncs, PostData } from "@/src/libs/contentServices";
import { useBookmarkFuncs, BookmarkWithId } from "@/src/libs/bookmark";
import PostCard from "./PostCard";

const ReadingListPage: FC = () => {
  const { user } = useRequireAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostData[]>([]);
  const { getBookmarks } = useBookmarkFuncs();
  const { getPostById } = postFuncs();

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      if (user) {
        const bookmarks: BookmarkWithId[] = await getBookmarks(user.uid);
        const posts = await Promise.all(
          bookmarks.map((bookmark) => getPostById(bookmark.postId))
        );
        setBookmarkedPosts(
          posts.filter((post): post is PostData => post !== null)
        );
      }
    };
    fetchBookmarkedPosts();
  }, [user, getBookmarks, getPostById]);

  if (!user) return <div>Please log in to view your reading list.</div>;

  return (
    <div>
      <h1>Your Reading List</h1>
      {bookmarkedPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {bookmarkedPosts.length === 0 && <p>Your reading list is empty.</p>}
    </div>
  );
};

export default ReadingListPage;
