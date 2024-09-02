import { FC, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import { setError, clearError } from "@/app/_store/errorSlice";
import { bookmarkFuncs } from "@/src/libs/contentServices";
import { FaBookmark } from "react-icons/fa6";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  userId: string;
  postId: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

const BookmarkBtn: FC<BookmarkButtonProps> = ({
  userId,
  postId,
  onBookmarkChange,
}) => {
  const { error } = useSelector((state: RootState) => state.error);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const dispatch = useDispatch();
  const {
    addBookmark,
    removeBookmark,
    isBookmarked: checkIsBookmarked,
  } = bookmarkFuncs();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const bookmarked = await checkIsBookmarked(userId, postId);
        setIsBookmarked(bookmarked);
        dispatch(clearError());
      } catch (error) {
        dispatch(setError("Failed to check bookmark status"));
        console.error("Error checking bookmark status:", error);
      }
    };

    checkBookmarkStatus();
  }, [userId, postId, checkIsBookmarked, dispatch]);

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(userId, postId);
        setIsBookmarked(false);
        if (typeof onBookmarkChange !== "undefined") {
          onBookmarkChange(false);
        }
      } else {
        await addBookmark(userId, postId);
        setIsBookmarked(true);
        if (typeof onBookmarkChange !== "undefined") {
          onBookmarkChange(true);
        }
      }
      dispatch(clearError());
    } catch (error) {
      dispatch(
        setError(
          isBookmarked ? "Failed to remove bookmark" : "Failed to add bookmark"
        )
      );
      console.error("Error toggling bookmark:", error);
    }
  };

  return (
    <button onClick={handleBookmarkToggle}>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {isBookmarked ? (
        <Bookmark className="text-blue-500" size={20} />
      ) : (
        <Bookmark className="" size={20} />
      )}
    </button>
  );
};

export default BookmarkBtn;
