"use client";

import { useEffect, FC, useState, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import ContentsNavigation from "./ContentsNav";
import PostCard from "./PostCard";
import { feeds, PostData } from "@/src/libs/contentServices";
import SearchBar from "./SearchBar";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/src/libs/firebase";

type SortBy = "recent" | "popular";
type DateRange = "all" | "today" | "thisWeek" | "thisMonth";

interface Filters {
  sortBy: SortBy;
  dateRange: DateRange;
}

interface FeedsPageProps {
  initialFeedType?: string;
}

const FeedsPage: FC<FeedsPageProps> = ({ initialFeedType }) => {
  const searchParams = useSearchParams();
  const { user } = useRequireAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState("");
  const [feedType, setFeedType] = useState(initialFeedType);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "recent",
    dateRange: "all",
  });

  useEffect(() => {
    setFeedType(searchParams.get("feedType") as string | undefined);
  }, [searchParams]);

  const { getPersonalizedFeed, getFollowingFeed, getLatestFeed } = feeds();

  const { ref, inView } = useInView({ threshold: 0 });

  const fetchMorePosts = useCallback(async () => {
    if (!user || !hasMore) return;
    setLoading(true);
    setError("");
    let fetchedPosts: PostData[] = [];
    const lastPostId = posts[posts.length - 1]?.id;

    try {
      switch (feedType) {
        case "following":
          fetchedPosts = await getFollowingFeed(user.uid, 10, lastPostId, {
            sortBy: filters.sortBy,
            dateRange: filters.dateRange,
          });
          break;
        case "latest":
          fetchedPosts = await getLatestFeed(10, lastPostId, {
            sortBy: filters.sortBy,
            dateRange: filters.dateRange,
          });
          break;
        default:
          fetchedPosts = await getPersonalizedFeed(user.uid, 10, lastPostId, {
            sortBy: filters.sortBy,
            dateRange: filters.dateRange,
          });
      }

      if (fetchedPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => {
          const newPosts = fetchedPosts.filter(
            (newPost) =>
              !prevPosts.some((existingPost) => existingPost.id === newPost.id)
          );
          const updatedPosts = [...prevPosts, ...newPosts];
          return updatedPosts;
        });
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Posts fetch failed, please refresh");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    getPersonalizedFeed,
    getFollowingFeed,
    getLatestFeed,
    feedType,
    hasMore,
    filters,
    posts,
  ]);

  const sortedPosts = useMemo(() => {
    if (filters.sortBy === "popular") {
      return [...posts].sort((a, b) => b.likes.length - a.likes.length);
    }
    return posts;
  }, [posts, filters.sortBy]);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    } else {
      //
    }
    setPosts([]);
    setHasMore(true);
    fetchMorePosts();
  }, [filters, feedType]);

  useEffect(() => {
    if (inView && !loading) {
      fetchMorePosts();
    }
  }, [inView, fetchMorePosts, loading]);

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters((prev) => {
      if (
        filterName === "sortBy" &&
        (value === "recent" || value === "popular")
      ) {
        return { ...prev, [filterName]: value };
      }
      if (
        filterName === "dateRange" &&
        (value === "all" ||
          value === "today" ||
          value === "thisWeek" ||
          value === "thisMonth")
      ) {
        return { ...prev, [filterName]: value };
      }
      return prev;
    });
    setPosts([]); // Reset posts when filters change
    setHasMore(true);
  };

  return (
    <div className="feed-container min-h-screen border">
      <div>
        <SearchBar />
      </div>
      <div>
        <ContentsNavigation />
      </div>
      <div className="feed-content">
        <div className="filter-options">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange("sortBy", e.target.value as SortBy)
            }
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) =>
              handleFilterChange("dateRange", e.target.value as DateRange)
            }
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {sortedPosts.map((post, index) => (
          <PostCard
            key={`${post.id}-${index}`}
            post={post}
            authorId={post.authorId}
          />
        ))}
        {hasMore && <div ref={ref}>{loading && <div>Loading...</div>}</div>}
        {!hasMore && <div>No more posts</div>}
      </div>
    </div>
  );
};

export default FeedsPage;
