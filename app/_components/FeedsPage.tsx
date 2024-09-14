"use client";

import {
  useEffect,
  FC,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useInView } from "react-intersection-observer";
import ContentsNavigation from "./ContentsNav";
import PostCardWithComments from "./PostCardWithComments";
import { feeds, PostData } from "@/src/libs/contentServices";
import { useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import MenuButton from "./MenuButton";
import FeedsPageSkeleton from "./skeletons/FeedsPageSkeleton";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import CustomPullToRefreshIndicator from "./CustomPullToRefreshIndicator";
import { useAuthentication } from "./AuthContext";
import ThemeToggle from "./ThemeToggle";

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
  const { user } = useAuthentication();
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

  const [refreshing, setRefreshing] = useState(false);
  const [pullDownDistance, setPullDownDistance] = useState(0);
  const pullDownThreshold = 80; // Pixels to pull down before refreshing
  const startY = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

   const searchInputRef = useRef<HTMLInputElement>(null);

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
    setIsSearchBarVisible((prev) => {
      if (!prev) {
        setTimeout(() => {
          const headerHeight = 56; // Adjust this value based on your header's actual height
          const searchBarElement = searchBarRef.current;
          const searchInputElement = searchInputRef.current;

          if (searchBarElement) {
            const searchBarRect = searchBarElement.getBoundingClientRect();
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            const targetScrollPosition =
              scrollTop + searchBarRect.top - headerHeight - 10; // 10px extra space

            window.scrollTo({
              top: targetScrollPosition,
              behavior: "smooth",
            });
          }

          searchInputElement?.focus();
        }, 100);
      }
      return !prev;
    });
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

  const refreshFeed = useCallback(async () => {
    setRefreshing(true);
    setPosts([]);
    setHasMore(true);
    try {
      await fetchMorePosts();
    } catch (error) {
      console.error("Error refreshing feed:", error);
      setError("Error refreshing feed");
    } finally {
      // Delay to keep the refresh indicator visible
      setTimeout(() => {
        setRefreshing(false);
        setPullDownDistance(0);
      }, 1000); // Adjust this delay as needed
    }
  }, [fetchMorePosts, setError, setPosts, setHasMore]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const touchStart = (e: globalThis.TouchEvent) => {
      if (content.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = null; // Reset if not at the top
      }
    };

    const touchMove = (e: globalThis.TouchEvent) => {
      if (startY.current === null) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && content.scrollTop === 0) {
        e.preventDefault();
        setPullDownDistance(distance);
      } else {
        setPullDownDistance(0);
      }
    };

    const touchEnd = () => {
      if (pullDownDistance > pullDownThreshold && content.scrollTop === 0) {
        refreshFeed();
      }
      setPullDownDistance(0);
      startY.current = null;
    };

    content.addEventListener("touchstart", touchStart);
    content.addEventListener("touchmove", touchMove);
    content.addEventListener("touchend", touchEnd);

    return () => {
      content.removeEventListener("touchstart", touchStart);
      content.removeEventListener("touchmove", touchMove);
      content.removeEventListener("touchend", touchEnd);
    };
  }, [pullDownDistance, pullDownThreshold, refreshFeed]);

  // Calculate the rotation angle for the arrow
  const arrowRotation = useMemo(() => {
    if (pullDownDistance >= pullDownThreshold) {
      return 180; // Fully rotated when ready to refresh
    }
    return (pullDownDistance / pullDownThreshold) * 180;
  }, [pullDownDistance, pullDownThreshold]);

  return (
    <div className="feed-container mt-14 flex flex-col dark:bg-headerColor">
      <header className="h-14 bg-customWhite3 dark:bg-primary fixed border border-t-0 border-l-0 border-r-0  dark:border-headerColor md:hidden top-0 left-0 z-10 w-full flex justify-around items-center">
        <div className="text-outline-teal -ml-8 p-1 text-black text-xl font-bold tracking-wide">
          Chatter
        </div>
        {/* <div className="absolute">
          <ThemeToggle />
        </div> */}
        <div
          ref={iconRef}
          onClick={toggleSearchBar}
          className=" p-2 md:hidden hover:bg-customWhite2 relative -right-16 dark:hover:bg-teal-700 opacity-80 rounded-lg"
        >
          <Search className="text-[22px] font-light md:hidden" />
        </div>

        <div className="flex z-50 items-center relative  gap-20">
          <button
            className="w-32 rounded-lg hidden border text-center relative py-2"
            onClick={handleCreatePostNavigation}
          >
            <FaPlus className="absolute top-3 left-4" /> Create
          </button>

          <MenuButton />
        </div>
      </header>
      <div
        ref={contentRef}
        className="flex-1 scroll-container overscroll-y-contain overflow-y-auto relative h-full pb-12"
      >
        <div
          className="w-full flex relative -mb-12 text-sm flex-col items-center justify-center transition-all duration-300 ease-out overflow-hidden"
          style={{
            height: refreshing
              ? `${pullDownThreshold}px`
              : `${Math.min(pullDownDistance, pullDownThreshold)}px`,
            opacity: refreshing
              ? 1
              : Math.min(pullDownDistance / pullDownThreshold, 1),
          }}
        >
          {refreshing ? (
            <>
              <CustomPullToRefreshIndicator refreshing={refreshing} />
              <span className="text-sm relative -top-2">Refreshing</span>
            </>
          ) : pullDownDistance > pullDownThreshold ? (
            <>
              <ArrowUp
                className="dark:text-white text-customBlack mb-2 animate-bounce"
                size={18}
              />
              <span className="text-sm relative -top-2">
                Release to refresh
              </span>
            </>
          ) : pullDownDistance > 0 && !refreshing ? ( // Only show when not refreshing
            <>
              <ArrowDown
                className="dark:text-white text-customBlack mb-2"
                size={18}
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              />
              <span className="dark:text-white text-customBlack text-sm relative -top-2">
                Pull down to refresh
              </span>
            </>
          ) : null}{" "}
          {/* Hide text when refreshing or after refresh */}
        </div>
        {isSearchBarVisible && (
          <div
            ref={searchBarRef}
            className={`w-11/12 m-auto -mb-14 md:hidden mt-20 transition-all duration-300 ease-in-out ${
              isSearchBarVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <SearchBar inputRef={searchInputRef} />
          </div>
        )}
        <div className="mt-[65px] p-2">
          <ContentsNavigation />
        </div>
        <div
          className={`feed-content  ${
            isSearchBarVisible ? "search-visible" : ""
          }`}
        >
          <div className="filter-option flex items-center justify-evenly mb-2 mt-2">
            <select
              className="p-1 rounded-md text-sm bg-customWhite3 dark:bg-primary border border-customWhite dark:border-teal-700 dark:text-white outline-none"
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange("sortBy", e.target.value as SortBy)
              }
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </select>
            <select
              className="p-1 rounded-md text-sm border dark:bg-primary bg-customWhite3 border-customWhite dark:border-teal-700 outline-none dark:text-white"
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
          {error && <p className="text-red-600 mt-2">{error}</p>}
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
    </div>
  );
};

export default FeedsPage;
