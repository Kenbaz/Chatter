"use client";

import { useEffect, FC, useState, useCallback, useMemo, useRef, TouchEvent } from "react";
import { useInView } from "react-intersection-observer";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import ContentsNavigation from "./ContentsNav";
import PostCardWithComments from "./PostCardWithComments";
import { feeds, PostData } from "@/src/libs/contentServices";
import { useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import { FaSearch, FaPlus, FaArrowDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import MenuButton from "./MenuButton";
import { throttle } from "lodash";

type SortBy = "recent" | "popular";
type DateRange = "all" | "today" | "thisWeek" | "thisMonth";

interface Filters {
  sortBy: SortBy;
  dateRange: DateRange;
}

interface RefreshArrowProps {
  rotation: number;
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
  // const [isPulling, setIsPulling] = useState(false);
  // const [pullStartY, setPullStartY] = useState(0);
  // const [pullMoveY, setPullMoveY] = useState(0);
  const [feedType, setFeedType] = useState(initialFeedType);
  const [hasMore, setHasMore] = useState(true);
  // const [arrowRotation, setArrowRotation] = useState(0);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    sortBy: "recent",
    dateRange: "all",
  });
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null)
  const pullRef = useRef({ startY: 0, moveY: 0, scrolling: false });
  const [pullState, setPullState] = useState({ isPulling: false, rotation: 0 });

  const { getPersonalizedFeed, getFollowingFeed, getLatestFeed } = feeds();

  const { ref, inView } = useInView({ threshold: 0 });

  const router = useRouter();

  useEffect(() => {
    setFeedType(searchParams.get("feedType") as string | undefined);
  }, [searchParams]);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 5;
  }, []);

  

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAtTop()) {
        pullRef.current.startY = e.touches[0].clientY;
        pullRef.current.scrolling = false;
      }
    },
    [isAtTop]
  );

 const handleTouchMove = useCallback(
   throttle((e: React.TouchEvent) => {
     if (pullRef.current.startY === 0 || pullRef.current.scrolling) return;
     const touch = e.touches[0];
     const pullDistance = touch.clientY - pullRef.current.startY;

     if (pullDistance > 0 && isAtTop()) {
       pullRef.current.moveY = pullDistance;
       const newRotation = Math.min(180, (pullDistance / 40) * 180);
       setPullState({ isPulling: true, rotation: newRotation });

       // Prevent scrolling by adjusting the scroll position
       if (containerRef.current) {
         containerRef.current.scrollTop = 0;
       }
     } else {
       pullRef.current.scrolling = true;
       resetPullState();
     }
   }, 16),
   [isAtTop]
  );

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
  }, [user, feedType, posts, hasMore, filters]);

  const refreshFeed = useCallback(() => {
    setPosts([]);
    setHasMore(true);
    fetchMorePosts();
  }, [fetchMorePosts]);
  
  const resetPullState = useCallback(() => {
    pullRef.current = { startY: 0, moveY: 0, scrolling: false };
    setPullState({ isPulling: false, rotation: 0 });
  }, []);

 const handleTouchEnd = useCallback(() => {
   if (pullRef.current.moveY > 40 && !pullRef.current.scrolling) {
     refreshFeed();
   }
   resetPullState();
 }, [refreshFeed, resetPullState]);
  
  const handleTouchCancel = useCallback(() => {
    resetPullState();
  }, [resetPullState]);

  const RefreshArrow: FC<RefreshArrowProps> = ({ rotation }) => (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.2s ease",
      }}
    >
      <FaArrowDown size={14} />
    </div>
  );

  const toggleSearchBar = () => {
    setIsSearchBarVisible((prev) => !prev);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      searchBarRef.current &&
      !searchBarRef.current.contains(event.target as Node) &&
      iconRef.current &&
      !iconRef.current.contains(event.target as Node)
    ) {
      setIsSearchBarVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

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

  return (
    <div
      ref={containerRef}
      className="feed-container h-auto pb-10 md:pl-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <header className="h-14 bg-primary fixed border border-t-0 border-l-0 border-r-0 border-headerColor md:hidden top-0 z-10 w-full flex justify-around items-center">
        <div className="text-outline-teal -ml-8 p-1 text-black text-xl font-bold tracking-wide">
          Chatter
        </div>
        <div
          ref={iconRef}
          onClick={toggleSearchBar}
          className=" p-2 md:hidden relative -right-16 hover:bg-teal-700 opacity-80 rounded-lg"
        >
          <FaSearch className="text-[22px] font-light md:hidden" />
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
      {pullState.isPulling && (
        <div
          style={{
            height: `${pullRef.current.moveY}px`,
            maxHeight: "100px",
            transition: "height 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBlockStart: "20px",
            marginBlockEnd: "-35px",
          }}
        >
          <div className="mt-10 flex items-center gap-1">
            <RefreshArrow rotation={pullState.rotation} />
            <span>
              {pullRef.current.moveY > 40
                ? "Release to refresh"
                : "Pull down to refresh"}
            </span>
          </div>
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
        <div className="filter-options flex items-center justify-evenly mb-2 mt-2">
          <select
            className="p-1 rounded-lg text-sm dark:bg-primary border border-teal-700 text-white outline-none"
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange("sortBy", e.target.value as SortBy)
            }
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
          <select
            className="p-1 rounded-lg text-sm border border-teal-700 outline-none text-white"
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
        {hasMore && <div ref={ref}>{loading && <div>Loading...</div>}</div>}
        {!hasMore && <div>No more posts</div>}
      </div>
    </div>
  );
};

export default FeedsPage;
