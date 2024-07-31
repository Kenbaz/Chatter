"use client";

import { useEffect, FC, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import CategoryNavigation from "./CategoryNav";
import PostCard from "./PostCard";
import { postFuncs, feeds, PostData } from "@/src/libs/contentServices";
import SearchBar from "./SearchBar";

interface FeedPageProps {
  slug?: string[];
}

type SortBy = "recent" | "popular";
type DateRange = "all" | "today" | "thisWeek" | "thisMonth";

interface Filters {
  sortBy: SortBy;
  dateRange: DateRange;
  category: string;
}

const FeedsPage: FC<FeedPageProps> = ({ slug }) => {
  const { user } = useRequireAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
   const [filters, setFilters] = useState<Filters>({
     sortBy: "recent",
     dateRange: "all",
     category: slug?.[1] || "",
   });

  const { getPostsByCategory } = postFuncs();
  const { getPersonalizedFeed } = feeds();

  const { ref, inView } = useInView({ threshold: 0 });

  const fetchMorePosts = useCallback(async () => {
    if (!user || !hasMore) return;
    setLoading(true);
    let fetchedPosts: PostData[] = [];
    const lastPostId = posts[posts.length - 1]?.id;

    try {
      if (slug?.[0] === "category" && slug[1]) {
        fetchedPosts = await getPostsByCategory(slug[1], 10, lastPostId, {
          sortBy: filters.sortBy,
          dateRange: filters.dateRange
        });
      } else {
        fetchedPosts = await getPersonalizedFeed(user.uid, 10, lastPostId, {
          sortBy: filters.sortBy,
          dateRange: filters.dateRange
        });
      }

      if (fetchedPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError('Posts fetch failed, please refresh');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    slug,
    getPostsByCategory,
    getPersonalizedFeed,
    hasMore,
    filters,
  ]);

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    fetchMorePosts();
  }, [slug, user, filters]);

  useEffect(() => {
    if (inView) {
      fetchMorePosts();
    }
  }, [inView, fetchMorePosts]);

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
      if (filterName === "category") {
        return { ...prev, [filterName]: value };
      }
      return prev;
    });
    setPosts([]); // Reset posts when filters change
    setHasMore(true);
  };

  return (
    <div className="feed-container">
      <div>
        <SearchBar />
      </div>
      <div>
        <CategoryNavigation />
      </div>
      <div className="feed-content">
        <div className="filter-options">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value as SortBy)}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value as DateRange)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <h1>{slug?.[0] === "category" ? `${slug[1]} Posts` : "For You"}</h1>
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} />
        ))}
        <div ref={ref}>
          {loading && <div>Loading...</div>}
          {!hasMore && <div>No more posts</div>}
        </div>
      </div>
    </div>
  );
};

export default FeedsPage;