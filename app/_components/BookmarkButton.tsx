'use client';

import { useState, useEffect, FC } from "react";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { useBookmarkFuncs } from "@/src/libs/bookmark";

interface BookmarkButtonProps {
    postId: string;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({ postId }) => {
    const { user } = useRequireAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    
    const { addBookmark, removeBookmark, isBookmarked: checkIsBookmarked, getBookmarks } = useBookmarkFuncs();

    useEffect(() => {
        const checkBookmarkStatus = async () => {
            if (user) {
                const bookmarked = await checkIsBookmarked(user.uid, postId);
                setIsBookmarked(bookmarked);
                if (bookmarked) {
                    const bookmarks = await getBookmarks(user.uid);
                    const bookmark = bookmarks.find(b => b.postId === postId);
                    if (bookmark) {
                        setBookmarkId(bookmark.id);
                    }
                }
            }
        };
        checkBookmarkStatus();
    }, [user, postId, checkIsBookmarked, getBookmarks]);

    const handleBookmarkToggle = async () => {
        if (!user) return;

        try {
            if (isBookmarked && bookmarkId) {
                await removeBookmark(bookmarkId);
                setBookmarkId(null);
            } else {
                const newBookmarkId = await addBookmark(user.uid, postId);
                setBookmarkId(newBookmarkId);
            }
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        }
    };

    if (!user) return null;

    return (
        <button onClick={handleBookmarkToggle}>
            {isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
        </button>
    )
};

export default BookmarkButton;