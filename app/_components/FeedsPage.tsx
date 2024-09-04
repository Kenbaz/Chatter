"use client";

import { useEffect, FC, useState, useCallback, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import ContentsNavigation from "./ContentsNav";
import PostCardWithComments from "./PostCardWithComments";
import { feeds, PostData } from "@/src/libs/contentServices";
import { useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import { FaSearch, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import MenuButton from "./MenuButton";
import FeedsPageSkeleton from "./skeletons/FeedsPageSkeleton";
import { Search } from "lucide-react";
import CustomPullToRefreshIndicator from "./CustomPullToRefreshIndicator";

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
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Pull to refresh states and ref
  const [isPulling, setIsPulling] = useState(false);
  const [pullHeight, setPullHeight] = useState(0);
  const maxPullHeight = 100;
  const touchStartY = useRef(0);

  useEffect(() => {
    setFeedType(searchParams.get("feedType") as string | undefined);
  }, [searchParams]);

  const { getPersonalizedFeed, getFollowingFeed, getLatestFeed } = feeds();

  const { ref, inView } = useInView({ threshold: 0 });

  const router = useRouter();

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

  const toggleSearchBar = () => {
    setIsSearchBarVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchBarRef.current &&
      !searchBarRef.current.contains(event.target as Node) &&
      iconRef.current &&
      !iconRef.current.contains(event.target as Node)
    ) {
      setIsSearchBarVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreatePostNavigation = () => {
    router.push("/create-post");
  };

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

  // Pull to refresh touch event handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && e.touches[0].clientY > touchStartY.current) {
      const distance = e.touches[0].clientY - maxPullHeight;
      setIsPulling(true);
      setPullHeight(Math.min(distance / 2, maxPullHeight));
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullHeight > 70) {
      setPosts([]);
      setHasMore(true);
    } 
    setIsPulling(false);
    setPullHeight(0);
  };

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, pullHeight, fetchMorePosts])

  return (
    <div className="feed-container h-auto pb-10">
      <header className="h-14 bg-primary fixed border border-t-0 border-l-0 border-r-0 border-headerColor md:hidden top-0 z-10 w-full flex justify-around items-center">
        <div className="text-outline-teal -ml-8 p-1 text-black text-xl font-bold tracking-wide">
          Chatter
        </div>
        <div
          ref={iconRef}
          onClick={toggleSearchBar}
          className=" p-2 md:hidden relative -right-16 hover:bg-teal-700 opacity-80 rounded-lg"
        >
          <Search className="text-[22px] font-light md:hidden" />
        </div>

        <div className="flex z-50 items-center gap-20">
          <button
            className="w-32 rounded-lg hidden border text-center relative py-2"
            onClick={handleCreatePostNavigation}
          >
            <FaPlus className="absolute top-3 left-4" /> Create
          </button>

          <MenuButton />
        </div>
      </header>
      {isPulling && (
        <div
          style={{ height: pullHeight }}
          className="flex items-center flex-col justify-center mt-14 -mb-12"
        >
          <CustomPullToRefreshIndicator
            refreshing={isPulling && pullHeight > 70}
          />
          <span className="relative -top-[0.7rem] text-sm">
            {pullHeight > 70 ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      )}
      {isSearchBarVisible && (
        <div
          ref={searchBarRef}
          className={`w-11/12 m-auto -mb-14 md:hidden mt-20 transition-all duration-300 ease-in-out ${
            isSearchBarVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
        >
          <SearchBar />
        </div>
      )}
      <div className="mt-[65px] p-2">
        <ContentsNavigation />
      </div>
      <div
        className={`feed-content ${isSearchBarVisible ? "search-visible" : ""}`}
      >
        <div className="filter-option flex items-center justify-evenly mb-2 mt-2">
          <select
            className="p-1 rounded-md text-sm dark:bg-primary border border-teal-700 text-white outline-none"
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange("sortBy", e.target.value as SortBy)
            }
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
          <select
            className="p-1 rounded-md text-sm border border-teal-700 outline-none text-white"
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
          <PostCardWithComments
            key={`${post.id}-${index}`}
            post={post}
            authorId={post.authorId}
          />
        ))}
        {hasMore && <div ref={ref}>{loading && <FeedsPageSkeleton />}</div>}
        {!hasMore && <div className="text-center mt-2">No more posts</div>}
      </div>
    </div>
  );
};

export default FeedsPage;
