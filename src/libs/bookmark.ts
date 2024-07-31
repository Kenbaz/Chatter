import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { setError, clearError } from "@/app/_store/errorSlice";
import { useDispatch } from "react-redux";


export interface Bookmark {
    userId: string;
    postId: string;
    createdAt: Timestamp;
}

export interface BookmarkWithId extends Bookmark {
    id: string;
}

export const useBookmarkFuncs = () => {
    const dispatch = useDispatch();

    const addBookmark = async (userId: string, postId: string): Promise<string> => {
        try {
            const bookmarkData: Bookmark = {
                userId,
                postId,
                createdAt: Timestamp.now()
            };
            const docRef = await addDoc(collection(firestore, "Bookmarks"), bookmarkData);
            dispatch(clearError());
            return docRef.id;
        } catch (error) {
            dispatch(setError('Failed to add bookmark'));
            console.error('Error adding bookmark', error);
            throw error;
        }
    };

    const removeBookmark = async (bookmarkId: string): Promise<void> => {
        try {
            await deleteDoc(doc(firestore, "Bookmarks", bookmarkId));
            dispatch(clearError());
        } catch (error) {
            dispatch(setError('Failed to delete bookmark'));
            console.error("Error removing bookmark", error);
            throw error;
        };
    };

    const getBookmarks = async (userId: string): Promise<BookmarkWithId[]> => {
        try {
            const bookmarksRef = collection(firestore, "Bookmarks");
            const q = query(bookmarksRef, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            dispatch(clearError());
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as BookmarkWithId));
        } catch (error) {
            dispatch(setError('Failed bookmarks fetch'));
            console.error('Error getting bookamrks', error);
            throw error;
        };
    };

    const isBookmarked = async (userId: string, postId: string): Promise<boolean> => {
        try {
            const bookmarksRef = collection(firestore, "Bookmarks");
            const q = query(
                bookmarksRef,
                where("userId", "==", userId),
                where("postId", "==", postId),
            );
            const querySnapshot = await getDocs(q);
            dispatch(clearError());
            return !querySnapshot.empty;
        } catch (error) {
            dispatch(setError('Bookmark check unsuccessful'));
            console.error('Error checking bookmark', error);
            throw error;
        };
    };

    return { addBookmark, removeBookmark, getBookmarks, isBookmarked };
};
