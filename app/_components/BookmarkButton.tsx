import { FC, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setError, clearError } from "@/app/_store/errorSlice";
import { bookmarkFuncs } from "@/src/libs/contentServices"; 
import { FaBookmark } from "react-icons/fa6";

interface BookmarkButtonProps {
  userId: string;
  postId: string;
}

 const BookmarkButton: FC<BookmarkButtonProps> = ({
  userId,
  postId,
}) => {
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
      } else {
        await addBookmark(userId, postId);
        setIsBookmarked(true);
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
      {isBookmarked ? <FaBookmark className="text-blue-500 text-xl"/> : <FaBookmark className="text-xl"/>}
    </button>
  );
};

export default BookmarkButton;