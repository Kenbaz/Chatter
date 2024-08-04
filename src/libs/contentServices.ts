import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  FieldValue,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  startAfter,
  startAt,
  endAt,
  arrayUnion,
  arrayRemove,
  runTransaction
} from "firebase/firestore";
import { ImplementFollowersFuncs, Profile } from "./userServices";
import { firestore } from "./firebase";
import { algoliaPostsIndex } from "./algoliaClient";
import { Hit } from "@algolia/client-search";
import {v4 as uuidv4 } from 'uuid'; 


interface Reply {
  id: string;
  commentId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: string;
  likes: string[]; 
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  content: string;
  createdAt: string;
  likes: string[];
  replies: Reply[];
}


interface AlgoliaPost {
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  author: string;
  status: "published | draft";
  coverImage: string;
  updatedAt: string;
  createdAt?: string;
  categoryId: string;
  likes: string[];
  comments: Comment[];
}

interface AlgoliaPostHit extends Hit<AlgoliaPost> {
  
}


export interface PostData {
  id: string;
  title: string;
  tags: string[];
  content: string;
  authorId: string;
  author: string;
  status: "published | draft";
  coverImage: string;
  updatedAt: string | FieldValue | Timestamp;
  createdAt?: string | FieldValue | Timestamp;
  categoryId: string;
  likes: string[];
  comments: Comment[];
}


const defaultTags = [
  "javascript",
  "typescript",
  "react",
  "vue",
  "angular",
  "nodejs",
  "python",
  "java",
  "c#",
  "php",
  "css",
  "html",
  "devOps",
  "ai",
  "machinelearning",
  "datascience",
  "mobile",
  "ios",
  "android",
  "cloudcomputing",
  "aws",
  "azure",
  "googlecloud",
  "docker",
  "kubernetes",
  "blockchain",
  "cybersecurity",
  "ui/ux",
  "design",
  "gamedev",
  "django",
  "tutorial",
  "beginners",
  "learning",
  "computerscience",
  "firebase",
  "database",
  "tailwindcss",
  "career",
  "interview",
  "git",
  "reactnative",
  "flutter",
  "frontend",
  "backend",
  "nextjs",
  "nuxtjs",
  "freelancing",
  "sql",
  "mongodb",
];

export const postFuncs = () => {

   const getPostsByAuthor = async (
     authorId: string,
     pageSize: number = 5,
     lastPostId?: string | null
   ): Promise<PostData[]> => {
     const postsRef = collection(firestore, "Posts");
     let q = query(
       postsRef,
       where("authorId", "==", authorId),
       where("status", "==", "published"),
       orderBy("createdAt", "desc"),
       limit(pageSize)
     );

     if (lastPostId) {
       const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
       q = query(q, startAfter(lastPostDoc));
     }

     const querySnapshot = await getDocs(q);
     return querySnapshot.docs.map(
       (doc) => ({ id: doc.id, ...doc.data() } as PostData)
     );
  };
  
  const searchPosts = async (
    searchQuery: string,
    limitCount = 5
  ): Promise<PostData[]> => {
    try {
      const { hits } = await algoliaPostsIndex.search<AlgoliaPostHit>(
        searchQuery,
        {
          hitsPerPage: limitCount,
          attributesToRetrieve: ["objectID", "title", "author"],
          attributesToHighlight: ["title", "author"],
        }
      );

      return hits.map((hit) => ({
        id: hit.objectID,
        title: hit._highlightResult?.title?.value || hit.title,
        content: hit._highlightResult?.content?.value || hit.content,
        tags: hit.tags,
        authorId: hit.authorId,
        author: hit.author,
        status: hit.status,
        coverImage: hit.coverImage,
        updatedAt: hit.updatedAt,
        createdAt: hit.createdAt,
        categoryId: hit.categoryId,
        likes: hit.likes,
        comments: hit.comments
      }));
    } catch (error) {
      console.error("Algolia search error:", error);
      throw error;
    }
  };

  const getPostById = async (postId: string): Promise<PostData | null> => {
    try {
      const postDoc = await getDoc(doc(firestore, "Posts", postId));
      if (postDoc.exists()) {
        return { id: postDoc.id, ...postDoc.data() } as PostData;
      } else {
        console.error("No such post");
        return null;
      }
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      return null;
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    try {
      const postRef = doc(firestore, "Posts", postId);
      await deleteDoc(postRef);
      console.log("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  return { getPostsByAuthor, searchPosts, getPostById, deletePost };
};

export const feeds = () => {

  const getPersonalizedFeed = async (
    userId: string,
    pageSize = 10,
    lastPostId?: string,
    filters?: {
      sortBy: "recent" | "popular";
      dateRange: "all" | "today" | "thisWeek" | "thisMonth";
    }
  ) => {
    const { getUserInterests } = Profile();

    const userInterests = await getUserInterests(userId);
    const postsRef = collection(firestore, "Posts");
    let q;
    if (userInterests.length > 0) {
       q = query(
         postsRef,
         where("tags", "array-contains-any", userInterests),
         where("status", "==", "published"),
         orderBy("createdAt", "desc")
       );
    } else {
      q = query(
        postsRef,
        where("status", "==", "published"),
        
      )
    }
    

    const getDateFilter = (dateRange: string) => {
      const now = new Date();
      switch (dateRange) {
        case "today":
          return new Date(now.setHours(0, 0, 0, 0));
        case "thisWeek":
          return new Date(now.setDate(now.getDate() - 7));
        case "thisMonth":
          return new Date(now.setMonth(now.getMonth() - 1));
        default:
          return new Date(0);
      }
    };

    // Apply date range filter
    if (filters?.dateRange !== "all" && filters?.dateRange !== undefined) {
      const dateFilter = getDateFilter(filters?.dateRange);
      q = query(q, where("createdAt", "==", dateFilter));
    }

    // Apply sorting
    if (filters?.sortBy === "popular") {
      q = query(q, orderBy("likes", "desc"));
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }

    q = query(q, limit(pageSize));

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title as string,
      tags: doc.data().tags as string[],
      content: doc.data().content as string,
      authorId: doc.data().authorId as string,
      author: doc.data().author as string,
      status: doc.data().status as "published | draft",
      coverImage: doc.data().coverImage as string,
      updatedAt: doc.data().updatedAt as string | FieldValue,
      createdAt: doc.data().createdAt as string | FieldValue,
      categoryId: doc.data().categoryId as string,
      likes: doc.data().likes as string[],
      comments: doc.data().comments as Comment[],
    }));
  };

  const getFollowingFeed = async (
    userId: string,
    pageSize = 10,
    lastPostId?: string,
    filters?: {
      sortBy: "recent" | "popular";
      dateRange: "all" | "today" | "thisWeek" | "thisMonth";
    }
  ) => {
    const { getFollowingUsers } = ImplementFollowersFuncs();
    const followingUsers = await getFollowingUsers(userId);
    const postsRef = collection(firestore, "Posts");
    let q;
    if (followingUsers.length > 0) {
      q = query(
        postsRef,
        where("authorId", "in", followingUsers),
        where("status", "==", "published")
      );
    } else {
      q = query(postsRef, where("status", "==", "published"));
    }

    const getDateFilter = (dateRange: string) => {
      const now = new Date();
      switch (dateRange) {
        case "today":
          return new Date(now.setHours(0, 0, 0, 0));
        case "thisWeek":
          return new Date(now.setDate(now.getDate() - 7));
        case "thisMonth":
          return new Date(now.setMonth(now.getMonth() - 1));
        default:
          return new Date(0);
      }
    };

    // Apply date range filter
    if (filters?.dateRange !== "all" && filters?.dateRange !== undefined) {
      const dateFilter = getDateFilter(filters?.dateRange);
      q = query(q, where("createdAt", ">=", dateFilter));
    }

    // Apply sorting
    if (filters?.sortBy === "popular") {
      q = query(q, orderBy("likes", "desc"), orderBy("createdAt", "desc"));
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }

    q = query(q, limit(pageSize));

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as PostData)
    );
  };
  
  const getLatestFeed = async (pageSize = 10, lastPostId?: string) => {
    const postsRef = collection(firestore, "Posts");
    let q = query(
      postsRef,
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as PostData)
    );
  };

  return { getPersonalizedFeed, getFollowingFeed, getLatestFeed };
};

export const tagFuncs = () => {
  const initializeDefaultTags = async () => {
    const tagsRef = collection(firestore, "Tags");
    const existingTags = await getAllTags();

    if (existingTags.length === 0) {
      for (const tagName of defaultTags) {
        await addTag(tagName);
      }
      console.log("Default tags initialized", tagsRef);
    }
  };

  const addTag = async (name: string): Promise<string> => {
    const tagsRef = collection(firestore, "Tags");
    const docRef = await addDoc(tagsRef, { name });
    return docRef.id;
  };

  const getAllTags = async (): Promise<{ id: string; name: string }[]> => {
    const tagsRef = collection(firestore, "Tags");
    const querySnapshot = await getDocs(tagsRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
  };

  const getPostsByTag = async (
    tag: string,
    pageSize = 10,
    lastPostId?: string
  ): Promise<PostData[]> => {
    const postsRef = collection(firestore, "Posts");
    let q = query(
      postsRef,
      where("tags", "array-contains", tag.toLowerCase()),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as PostData)
    );
  };

  const getTagNames = async (tagIds: string[]): Promise<string[]> => {
    const allTags = await getAllTags();
    const tagMap = new Map(allTags.map((tag) => [tag.id, tag.name]));
    return tagIds.map((id) => tagMap.get(id) || "");
  };

  return {
    initializeDefaultTags,
    addTag,
    getAllTags,
    getPostsByTag,
    getTagNames,
  };
};

export const likeFuncs = () => {
  const likePost = async (userId: string, postId: string) => {
    try {
      const postRef = doc(firestore, "Posts", postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const unlikePost = async (userId: string, postId: string) => {
    try {
      const postRef = doc(firestore, "Posts", postId);
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error unliking post');
    }
  };

  return { likePost, unlikePost };
};

export const commentFuncs = () => {
  const addComment = async (
    postId: string,
    authorId: string,
    content: string,
    author: string
  ): Promise<Comment> => {
    try {
      const postRef = doc(firestore, "Posts", postId);

      const newComment: Comment = {
        id: uuidv4(), // Generate a new ID for the comment
        postId,
        authorId,
        author,
        content,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: [],
      };

      await runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw new Error("Post not found");
        }

        const post = postDoc.data() as PostData;
        const updatedComments = [...(post.comments || []), newComment];

        transaction.update(postRef, { comments: updatedComments });
      });

      console.log("Comment added successfully:", newComment);
      return newComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const commentRef = doc(firestore, "Comments", commentId);
      await updateDoc(commentRef, { content });
    } catch (error) {
      console.error(`Error updating comment: ${error}`);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const commentRef = doc(firestore, "Comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error(`Error deleting comment: ${error}`);
    }
  };

  const getComments = async (postId: string): Promise<Comment[]> => {
    const commentsRef = collection(firestore, "Comments");
    const q = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Comment)
    );
  };

  const addReply = async (
    postId: string,
    commentId: string,
    authorId: string,
    content: string,
    author: string
  ): Promise<Reply> => {
    try {
      const replyData: Reply = {
        id: uuidv4(),
        authorId,
        commentId,
        content,
        author,
        createdAt: new Date().toISOString(),
        likes: [],
      };
      const postRef = doc(firestore, "Posts", postId);

      await runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw new Error("Post not found");
        }

        const post = postDoc.data() as PostData;
        
         const updatedComments = post.comments.map((comment) => {
           if (comment.id === commentId) {
             return {
               ...comment,
               replies: [...(comment.replies || []), replyData],
             };
           }
           return comment;
         });

        transaction.update(postRef, { comments: updatedComments });
      });

      return replyData;
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  const likeComment = async (postId: string, commentId: string, userId: string) => {
    try {
      const postRef = doc(firestore, "Posts", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const post = postDoc.data() as PostData;
        const updatedComments = post.comments.map(comment => comment.id === commentId ? { ...comment, likes: [...comment.likes, userId] } : comment);

        await updateDoc(postRef, { comments: updatedComments });
      } else {
        throw new Error('Post not found');
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  };

  const unlikeComment = async (
    postId: string,
    commentId: string,
    userId: string
  ) => {
    try {
      const postRef = doc(firestore, "Posts", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const post = postDoc.data() as PostData;
        const updatedComments = post.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes.filter((id) => id !== userId) }
            : comment
        );

        await updateDoc(postRef, { comments: updatedComments });
      } else {
        throw new Error("Post not found");
      }
    } catch (error) {
      console.error("Error unliking comment:", error);
      throw error;
    }
  };

  return { addComment, updateComment, deleteComment, getComments, addReply, likeComment, unlikeComment };
};