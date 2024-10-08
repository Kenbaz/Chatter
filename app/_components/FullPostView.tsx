"use client";

import { useEffect, FC, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Markdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  PostData,
  likeFuncs,
  commentFuncs,
  Comment,
} from "@/src/libs/contentServices";
import { ImplementFollowersFuncs, Profile } from "@/src/libs/userServices";
import { postFuncs } from "@/src/libs/contentServices";
import Image from "next/image";
import Link from "next/link";
import { Timestamp, FieldValue } from "firebase/firestore";
import ConfirmModal from "./ConfirmModal";
import { algoliaPostsIndex } from "@/src/libs/algoliaClient";
import { analyticsFuncs } from "@/src/libs/contentServices";
import BookmarkButton from "./BookmarkButton";
import { FaEllipsis } from "react-icons/fa6";
import ShareButtons from "./ShareButtons";
import "prismjs/themes/prism-tomorrow.css";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { useAuthentication } from "./AuthContext";

type FullPostViewProps = {
  postId: string;
};

type ReplyingTo = {
  commentId: string;
  replyId: string;
} | null;

const FullPostView: FC<FullPostViewProps> = ({ postId }) => {
  const { user } = useAuthentication();
  const params = useParams();
  const searchParams = useSearchParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [isReplyLiked, setIsReplyLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorProfilePicture, setAuthorProfilePicture] = useState("");
  const [newReply, setNewReply] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [openMenuCommentId, setOpenMenuCommentId] = useState<string | null>(
    null
  );
  const [openMenuReplyId, setOpenMenuReplyId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [replyingToReply, setReplyingToReply] = useState<ReplyingTo>(null);
  const [newReplyToReply, setNewReplyToReply] = useState("");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();
  const commentsRef = useRef<{ [key: string]: HTMLDivElement }>({});

  const { getPostById, deletePost } = postFuncs();
  const { likePost, unlikePost } = likeFuncs();
  const {
    addComment,
    getComments,
    updateComment,
    deleteComment,
    addReply,
    likeComment,
    unlikeComment,
    likeReply,
    unlikeReply,
    deleteReply,
    updateReply,
    replyToReply,
  } = commentFuncs();
  const { followUser, unfollowUser, isFollowingUser } =
    ImplementFollowersFuncs();

  const { fetchAuthorName, getUserProfilePicture } = Profile();
  const { trackView } = analyticsFuncs();

  const scrollToComment = useCallback(() => {
    const commentId = searchParams.get("scrollTo");

    if (commentId) {
      const commentElement = document.getElementById(`comment-${commentId}`);

      if (commentElement) {
        commentElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      scrollToComment();
    }
  }, [loading, scrollToComment]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id || !user) return;

      try {
        const postData = await getPostById(postId as string);
        if (postData) {
          setPost(postData);
          setIsLiked(postData.likes?.includes(user.uid) || false);
          setComments(postData.comments || []);
          const following = await isFollowingUser(user.uid, postData.authorId);
          setIsFollowing(following);
          setIsOwnPost(user.uid === postData.authorId);

          const name = await fetchAuthorName(postData.authorId);
          setAuthorName(name);

          const profilePicture = await getUserProfilePicture(postData.authorId);
          if (typeof profilePicture !== "undefined") {
            setAuthorProfilePicture(profilePicture);
          }
          setBookmarkCount(postData.bookmarks?.length || 0);

          await trackView(postData.id, user.uid);
        } else {
          console.log("No such post!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  const markdownComponents: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl dark:text-white font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl dark:text-white font-bold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl dark:text-white font-bold my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg dark:text-white font-bold my-2" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-base dark:text-white font-bold my-1" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-sm dark:text-white font-bold my-1" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside my-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside my-4" {...props} />
    ),
    u: ({ node, ...props }) => <u className="underline" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 dark:border-lightGray border-gray-900 pl-4 py-2 my-2 "
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-4 whitespace-pre-wrap" {...props} />
    ),
    pre: ({ node, children, ...props }) => (
      <pre
        className="whitespace-pre-wrap break-words  bg-black text-white p-4 rounded-md"
        {...props}
      >
        {children}
      </pre>
    ),
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:underline" {...props} />
    ),
    img: ({ node, ...props }) => (
      <Image
        src={props.src || ""}
        alt={props.alt || ""}
        width={400}
        height={200}
        style={{ objectFit: "contain" }}
      />
    ),
  };

  const toggleShareButtons = () => {
    setShowShareButtons(!showShareButtons);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showShareButtons &&
        !(event.target as Element).closest(".share-buttons-container") &&
        !(event.target as Element).closest(".ellipsis-button")
      ) {
        setShowShareButtons(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareButtons]);

  const handleLike = async () => {
    if (!user || !post) return;
    try {
      const button = document.querySelector(".like-button");
      button?.classList.add("animating");
      setTimeout(() => button?.classList.remove("animating"), 500);

      if (isLiked) {
        await unlikePost(user.uid, post.id);
      } else {
        await likePost(user.uid, post.id);
      }
      setIsLiked(!isLiked);
      setPost((prevPost) =>
        prevPost
          ? {
              ...prevPost,
              likes: isLiked
                ? prevPost.likes.filter((id) => id !== user.uid)
                : [...prevPost.likes, user.uid],
            }
          : null
      );
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  const handleCommentClick = () => {
    if (commentInputRef.current) {
      commentInputRef.current.scrollIntoView({ behavior: "smooth" });
      commentInputRef.current.focus();
    }
  };

  const updateBookmarkCount = (isBookmarked: boolean) => {
    setBookmarkCount((prev) => (isBookmarked ? prev + 1 : prev - 1));
  };

  const handleDeletePost = async () => {
    if (!user || !post) return;

    try {
      await deletePost(post.id);
      await algoliaPostsIndex.deleteObject(post.id);
      setSuccessMessage("Post deleted");
      setTimeout(() => {
        setSuccessMessage("");
        router.push("/feeds");
      }, 1000);
    } catch (error) {
      console.error("Error deleting Post:", error);
      setError("Failed to delete");
      setTimeout(() => {
        setError("");
      }, 1000);
    }
  };

  const handleDeleteDraftPost = async () => {
    if (!user || !post) return;

    try {
      await deletePost(post.id);
      setSuccessMessage("Draft post deleted");
      setTimeout(() => {
        setSuccessMessage("");
        router.push(`/profile/${user.uid}`);
      }, 1000);
    } catch (error) {
      console.error("Error deleting draft post:", error);
      setError("Failed to delete draft post");
      setTimeout(() => {
        setError("");
      }, 1000);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleFollow = async () => {
    if (!user || !post) return;
    try {
      if (user.uid === post.authorId) return;

      if (isFollowing) {
        await unfollowUser(user.uid, post.authorId);
      } else {
        await followUser(user.uid, post.authorId);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !post || !newComment.trim()) return;
    try {
      const currentUserName = await fetchAuthorName(user.uid);
      const profilePicture = await getUserProfilePicture(user.uid);
      const newCommentObj = await addComment(
        post.id,
        user.uid,
        newComment.trim(),
        currentUserName,
        profilePicture
      );
      setComments((prevComments) => [...prevComments, newCommentObj]);
      setNewComment("");

      // Update the post with the new comment count
      setPost((prevPost) => {
        if (!prevPost) return null;

        const updatedComments = [...prevPost.comments, newCommentObj];

        return {
          ...prevPost,
          comments: updatedComments,
        };
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!newContent.trim() || !user || !post) return;

    try {
      await updateComment(post.id, commentId, newContent.trim(), user.uid);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: newContent.trim() }
            : comment
        )
      );

      setEditingCommentId(null);
    } catch (error) {
      console.error("Error editing comment:", error);
      // Optionally, you can show an error message to the user here.
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !post) return;

    try {
      await deleteComment(post.id, commentId, user.uid);

      // Update local state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );

      // Update the post with the new comment count
      setPost((prevPost) => {
        if (!prevPost) return null;

        const updatedComments = prevPost.comments.filter(
          (comment) => comment.id !== commentId
        );

        return {
          ...prevPost,
          comments: updatedComments,
        };
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const handleViewAnalytics = (postId: string) => {
    router.push(`/stats/${postId}`);
  };

  const handleAddReply = async (commentId: string) => {
    if (!user || !post || !newReply.trim()) return;
    try {
      const currentUserName = await fetchAuthorName(user.uid);
      const profilePicture = await getUserProfilePicture(user.uid);
      const newReplyObj = await addReply(
        post.id,
        commentId,
        user.uid,
        newReply.trim(),
        currentUserName,
        profilePicture
      );
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReplyObj] }
            : comment
        )
      );
      console.log(
        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, replies: [...comment.replies, newReplyObj] }
              : comment
          )
        )
      );
      setNewReply("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleEditReply = async (
    commentId: string,
    replyId: string,
    newContent: string
  ) => {
    if (!newContent.trim() || !user || !post) return;

    try {
      await updateReply(
        post.id,
        commentId,
        replyId,
        newContent.trim(),
        user.uid
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === replyId
                    ? { ...reply, content: newContent.trim() }
                    : reply
                ),
              }
            : comment
        )
      );

      setEditingReplyId(null);
    } catch (error) {
      console.error("Error editing reply:", error);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!user || !post) return;

    try {
      await deleteReply(post.id, commentId, replyId, user.uid);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply.id !== replyId
                ),
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const handleReplyToReply = async (
    commentId: string,
    parentReplyId: string
  ) => {
    if (!newReplyToReply.trim() || !user || !post) return;

    try {
      const currentUserName = await fetchAuthorName(user.uid);
      const profilePicture = await getUserProfilePicture(user.uid);
      const newReply = await replyToReply(
        post.id,
        commentId,
        parentReplyId,
        user.uid,
        newReplyToReply.trim(),
        currentUserName,
        profilePicture
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment
        )
      );

      setReplyingToReply(null);
      setNewReplyToReply("");
    } catch (error) {
      console.error("Error replying to reply:", error);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewReply("");
  };

  const handleLikeComment = async (
    commentId: string,
    isCommentLiked: boolean
  ) => {
    if (!user || !post) return;
    try {
      if (isCommentLiked) {
        await unlikeComment(post.id, commentId, user.uid);
      } else {
        await likeComment(post.id, commentId, user.uid);
      }
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: isCommentLiked
                  ? comment.likes.filter((id) => id !== user.uid)
                  : [...comment.likes, user.uid],
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking/unliking comment:", error);
    }
  };

  const handleLikeReply = async (
    commentId: string,
    replyId: string,
    isReplyLiked: boolean
  ) => {
    if (!user || !post) return;
    try {
      if (isReplyLiked) {
        await unlikeReply(post.id, commentId, replyId, user.uid);
      } else {
        await likeReply(post.id, commentId, replyId, user.uid);
      }
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === replyId
                    ? {
                        ...reply,
                        likes: isReplyLiked
                          ? reply.likes.filter((id) => id !== user.uid)
                          : [...reply.likes, user.uid],
                      }
                    : reply
                ),
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking/unliking reply:", error);
    }
  };

  function formatDateString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options).replace(",", "");
  }

  function formatDate(
    date: string | number | Date | Timestamp | FieldValue | undefined
  ): string {
    if (date instanceof Timestamp) {
      return formatDateString(date.toDate());
    } else if (date instanceof Date) {
      return formatDateString(date);
    } else if (typeof date === "string" || typeof date === "number") {
      return formatDateString(new Date(date));
    } else if (date instanceof FieldValue) {
      return "Pending";
    } else {
      return "Unknown date";
    }
  }

  const handleEditPost = (postId: string) => {
    router.push(`/create-post/${postId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuCommentId && !(event.target as Element).closest(".comment")) {
        setOpenMenuCommentId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuCommentId]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (openMenuReplyId && !(event.target as Element).closest(".reply")) {
        setOpenMenuReplyId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openMenuReplyId]);

  if (loading)
    return (
      <div>
        <Loader2
          size={20}
          className="animate-spin relative left-[50%] top-[50%] text-customWhite"
        />
      </div>
    );
  if (!user) return;
  if (!post) return <div>Post not found</div>;

  if (post.status === "draft") {
    return (
      <div className="full-post-container mt-14 relative h-auto pb-10 md:w-[91%] md:m-auto md:mt-14">
        <div className="full-post-content dark:bg-primary bg-customWhite3 max-w-4xl mx-auto">
          <div className="p-2">
            {post.coverImage && (
              <div className="relative w-full aspect-[17/8] lg:landscape:aspect-[12/4] mb-5">
                <Image
                  src={post.coverImage}
                  alt="Cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="md:rounded-md"
                />
              </div>
            )}
            {user && post && user.uid === post.authorId && (
              <div className=" p-2 -top-[15px] relative justify-end font-light text-[15px] -mb-4 flex gap-4">
                <button
                  className="dark:text-white dark:hover:text-gold4 hover:text-gold4"
                  onClick={() => handleEditPost(post.id)}
                >
                  Edit
                </button>
                <button
                  onClick={openDeleteModal}
                  className="delete-post-btn dark:text-white dark:hover:text-red-600 hover:text-red-700"
                >
                  Delete post
                </button>
              </div>
            )}
            <div className="mb-4 text-sm flex gap-2 items-center">
              <div className="w-[40px] h-[40px] rounded-[50%] overflow-hidden flex justify-center items-center">
                <Image
                  src={
                    authorProfilePicture ||
                    "/images/default-profile-image-2.jpg"
                  }
                  alt="avatar"
                  width={40}
                  height={40}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex flex-col">
                <Link href={`/profile/${post.authorId}`}>
                  <p className="dark:text-tinWhite font-semibold text-base tracking-wide">
                    {authorName}
                  </p>
                </Link>
                <small className="text-red-600 text-[14px]">
                  This draft can only be seen by you.
                </small>
              </div>
            </div>
            <h1 className="text-3xl dark:text-white font-bold mb-4">
              {post.title}
            </h1>
            <div className="mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full dark:bg-customGray1 bg-customWhite2 mr-2 px-3 py-1 text-sm font-semibold dark:text-tinWhite text-gray-800 mb-2"
                >
                  <span className="text-gray-500">#</span>
                  {tag}
                </span>
              ))}
            </div>
            <div className="prose max-w-none">
              <Markdown
                rehypePlugins={[
                  rehypeRaw,
                  [rehypeHighlight, { detectLanguage: true, alias: {} }],
                ]}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {post.content}
              </Markdown>
            </div>
          </div>
        </div>
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteDraftPost}
          message="Are you sure you want to delete this post?"
        />
      </div>
    );
  }

  return (
    <>
      <div className="full-post-container post-layout mt-14 relative pb-12 md:w-[79%] md:m-auto md:mt-16 lg:landscape:w-[70%] lg:mt-16 lg:w-[70%]">
        {post && (
          <div className="full-post-content dark:bg-primary bg-customWhite3 max-w-4xl mx-auto rounded-md xl:w-[80%] 2xl:w-[80%]">
            {post.coverImage && (
              <div className="relative w-full aspect-[17/8] lg:landscape:aspect-[12/4] mb-5">
                <Image
                  src={post.coverImage}
                  alt="Cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="md:rounded-md"
                />
              </div>
            )}
            {user && post && user.uid === post.authorId && (
              <div className=" p-2 -top-[15px] relative justify-end font-light text-[15px] -mb-4 flex gap-4">
                <button
                  className="dark:text-white dark:hover:text-gold4 hover:text-gold1"
                  onClick={() => handleEditPost(post.id)}
                >
                  Edit
                </button>
                <button
                  onClick={openDeleteModal}
                  className="delete-post-btn dark:text-white dark:hover:text-red-600 hover:text-red-700"
                >
                  Delete post
                </button>
                <button
                  onClick={() => handleViewAnalytics(post.id)}
                  className="view-analytics-btn dark:text-white dark:hover:text-gold4 hover:text-gold1"
                >
                  Stats
                </button>
              </div>
            )}
            {user && post && !isOwnPost && (
              <button
                onClick={handleFollow}
                className="text-[15px] relative dark:bg-teal-700 dark:hover:bg-teal-800 bg-teal-800 hover:bg-teal-900 text-tinWhite px-2 w-[23%] md:w-[15%] md:left-[80%] font-semibold left-[75%] p-1 rounded-md"
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}

            <div className="p-2 md:pr-20 md:pl-14">
              <div className="mb-4 text-sm flex gap-2 items-center">
                <div className="w-[40px] h-[40px]  rounded-[50%] overflow-hidden flex justify-center items-center">
                  <Image
                    src={
                      authorProfilePicture ||
                      "/images/default-profile-image-2.jpg"
                    }
                    alt="avatar"
                    width={40}
                    height={40}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex flex-col">
                  <Link href={`/profile/${post.authorId}`}>
                    <p className="dark:text-tinWhite font-semibold text-base tracking-wide">
                      {authorName}
                    </p>
                  </Link>
                  <small className="text-gray-600 text-[14px]">
                    Published on {formatDate(post.createdAt)}
                  </small>
                </div>
              </div>
              <h1 className="text-3xl dark:text-white font-bold mb-4">
                {post.title}
              </h1>
              <div className="mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block rounded-full mr-2 dark:bg-customGray1 bg-customWhite2 px-3 py-1 text-sm font-semibold dark:text-gray-200 text-gray-800 mb-2"
                  >
                    <span className="dark:text-gray-400 text-gray-500">#</span>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="prose max-w-none">
                <Markdown
                  rehypePlugins={[
                    rehypeRaw,
                    [rehypeHighlight, { detectLanguage: true, alias: {} }],
                  ]}
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {post.content}
                </Markdown>
              </div>
            </div>
          </div>
        )}
        <div className="post-actions">
          <div className="flex items-center h-[9%] w-full p-4 dark:bg-headerColor bg-customWhite3 border border-l-0 border-r-0 border-b-0 dark:border-t-0 justify-around fixed z-50 left-0 bottom-0 md:w-[10.5%] md:flex-col dark:md:bg-headerColor md:bg-customWhite2 md:h-[30%] md:border-t-0 md:left-0 md:top-16 lg:landscape:w-[10%] lg:landscape:flex-col lg:landscape:h-[50%] lg:landscape:left-10 lg:landscape:top-14 lg:w-[10%] lg:flex-col lg:h-[30%] lg:left-7 lg:top-16 xl:hidden">
            <button
              className="like-button relative flex items-center gap-2 lg:flex-col md:flex-col"
              onClick={handleLike}
            >
              <span className="text-2xl">
                {isLiked ? (
                  <FaHeart className="text-red-600 transition-all duration-200 ease-in-out cursor-pointer" />
                ) : (
                  <Heart className="cursor-pointer transition-all duration-200 ease-in-out" />
                )}
              </span>
              <span className="font-light">{post.likes.length}</span>
              <span className="like-animation absolute inset-0"></span>
            </button>
            <div
              className="flex items-center gap-2 lg:flex-col md:flex-col"
              onClick={handleCommentClick}
            >
              <MessageCircle className="text-xl cursor-pointer" />
              <span className="font-light">{post.comments.length}</span>
            </div>
            <div className="flex items-center gap-2 lg:flex-col md:flex-col">
              <BookmarkButton
                postId={post.id}
                userId={user.uid}
                onBookmarkChange={updateBookmarkCount}
              />
              <span className="font-light cursor-none">{bookmarkCount}</span>
            </div>
            <div className="relative ellipsis-button">
              <button onClick={toggleShareButtons} className="text-2xl">
                <FaEllipsis />
              </button>
              {showShareButtons && (
                <>
                  <div className="share-buttons-container w-[95.5%] h-[25%] top-[64.4%] fixed z-20 right-[10px] mt-2 dark:border-customGray bg-customWhite3 dark:bg-primary border rounded shadow-lg p-2 md:top-[29%] md:w-[30%] md:left-[9%] md:h-[17%] lg:landscape:left-[7rem] lg:landscape:top-[19rem] lg:landscape:h-[30%] lg:landscape:w-[25%] lg:left-[7rem] lg:top-[25rem] xl:hidden">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      postAuthor={post.author}
                    />
                  </div>
                  <div className="share-buttons-container hidden xl:block xl:fixed xl:w-[20%] xl:z-20 xl:h-[25%] xl:left-[8rem] xl:top-[25rem] border dark:border-customGray rouned-md dark:bg-primary bg-customWhite3 shadow-lg p-2 ">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      postAuthor={post.author}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden xl:flex xl:fixed xl:w-[10%] xl:h-[45%] xl:justify-around xl:z-50 xl:left-[9rem] xl:top-[5rem] xl:flex-col xl:items-center xl:p-4 2xl:left-[14rem] 2xl:top-[6rem] 2xl:w-[5%] dark:bg-headerColor bg-customWhite2">
            <button
              className="like-button relative flex items-center gap-2 lg:flex-col md:flex-col"
              onClick={handleLike}
            >
              <span className="text-2xl">
                {isLiked ? (
                  <FaHeart className="text-red-600 transition-all duration-200 ease-in-out cursor-pointer" />
                ) : (
                  <Heart className="cursor-pointer transition-all duration-200 ease-in-out" />
                )}
              </span>
              <span className="font-light">{post.likes.length}</span>
              <span className="like-animation absolute inset-0"></span>
            </button>
            <div
              className="flex items-center gap-2 lg:flex-col md:flex-col"
              onClick={handleCommentClick}
            >
              <MessageCircle className="text-xl cursor-pointer" />
              <span className="font-light">{post.comments.length}</span>
            </div>
            <div className="flex items-center gap-2 lg:flex-col md:flex-col">
              <BookmarkButton
                postId={post.id}
                userId={user.uid}
                onBookmarkChange={updateBookmarkCount}
              />
              <span className="font-light">{bookmarkCount}</span>
            </div>
            <div className="relative ellipsis-button">
              <button onClick={toggleShareButtons} className="text-2xl">
                <FaEllipsis className="hover:text-gray-400 transition-colors duration-200" />
              </button>
              {showShareButtons && (
                <>
                  <div className="share-buttons-container w-[95.5%] h-[25%] top-[64.4%] fixed z-20 right-[10px] mt-2 dark:border-customGray bg-customWhite3 dark:bg-primary border rounded shadow-lg p-2 md:top-[22rem] md:w-[30%] md:left-[5rem] md:h-[20%] lg:landscape:left-[7rem] lg:landscape:top-[19rem] lg:landscape:h-[20%] lg:landscape:w-[25%] lg:left-[7rem] lg:top-[25rem] xl:hidden">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      postAuthor={post.author}
                    />
                  </div>
                  <div className="share-buttons-container rounded-md hidden xl:block xl:fixed xl:w-[20%] xl:z-20 xl:h-[25%] xl:left-[14.3rem] xl:top-[24.5rem] 2xl:left-[18rem] 2xl:top-[23.5rem] border dark:border-customGray rouned-md dark:bg-primary bg-customWhite3 shadow-lg p-2 ">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      postAuthor={post.author}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="comments-section p-2 mt-2 pb-[60px] bg-customWhite3 dark:bg-primary md:pr-36 md:pl-10 xl:w-[80%] xl:m-auto xl:mt-3 2xl:w-[80%] 2xl:rounded-md ">
          <h3 className="dark:text-white xl:text-xl xl:pb-2 mb-4 font-semibold">
            Comments
          </h3>
          <div className="flex flex-col gap-2 mb-10">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="border dark:border-teal-700 rounded-md p-2 outline-none"
            />
            <button
              className="w-20 p-1 rounded-lg text-white dark:text-customBlack bg-teal-800"
              onClick={handleAddComment}
            >
              Submit
            </button>
          </div>
          <div className="">
            {comments.map((comment) => (
              <div
                key={comment.id}
                ref={(el) => {
                  if (el) commentsRef.current[comment.id] = el;
                }}
                id={`comment-${comment.id}`}
                className="comment"
              >
                <div className="flex mb-3">
                  <div>
                    <div className="w-[20px] h-[20px] rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center">
                      <Image
                        src={
                          comment.profilePicture ||
                          "/images/default-profile-image-2.jpg"
                        }
                        alt="avatar"
                        width={20}
                        height={20}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="h-5 border-teal-700 border-dashed border w-0 ml-[9px] mt-[1px] "></div>
                  </div>
                  <div className="comment-box relative -mt-6">
                    <div className="flex relative flex-col pt-2 p-[10px] border dark:border-customGray rounded-lg mb-2 ">
                      {user.uid !== comment.authorId && (
                        <div className="mb-3"></div>
                      )}
                      {user.uid === comment.authorId && (
                        <div className="relative ml-auto -mb-3">
                          <button
                            className="dark:text-gray-500 hover:text-gray-700"
                            onClick={() =>
                              setOpenMenuCommentId(
                                openMenuCommentId === comment.id
                                  ? null
                                  : comment.id
                              )
                            }
                          >
                            <FaEllipsis className="dark:hover:text-white hover:text-black transition-colors duration-200" />
                          </button>
                          {openMenuCommentId === comment.id && (
                            <div className="absolute right-0 mt-2 w-48 dark:bg-primary bg-customWhite3 border dark:border-customGray rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  className="block w-[95%] rounded-md m-auto text-left px-2 py-2 text-sm dark:text-gray-200 hover:text-white hover:bg-teal-800 transition-colors duration-200"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentContent(comment.content);
                                    setOpenMenuCommentId(null);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="block w-[95%] rounded-md m-auto text-left px-2 py-2 text-sm dark:text-gray-200 hover:text-white hover:bg-teal-800 transition-colors duration-200"
                                  onClick={() => {
                                    handleDeleteComment(comment.id);
                                    setOpenMenuCommentId(null);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="">
                        <small className="dark:text-gray-300 text-gray-800">
                          <Link className="dark:hover:text-white hover:text-customBlack" href={`/profile/${comment.authorId}`}>
                            {comment.author}
                          </Link>{" "}
                          on {formatDate(comment.createdAt)}
                        </small>
                        <p className="mt-3 w-full tracking-normal text-[15px]">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-4 items-center gap-7">
                      <button
                        className={`mb-4 relative flex items-center gap-2 ${
                          comment.likes.includes(user?.uid)
                            ? "liked-comment"
                            : ""
                        }`}
                        onClick={() =>
                          handleLikeComment(
                            comment.id,
                            comment.likes.includes(user?.uid)
                          )
                        }
                      >
                        <span className="p-1 relative">
                          {comment.likes.includes(user?.uid) ? (
                            <FaHeart
                              size={19}
                              className="text-red-600 transition-all duration-200 ease-in-out"
                            />
                          ) : (
                            <Heart
                              size={19}
                              className="transition-all duration-200 ease-in-out"
                            />
                          )}
                        </span>
                        <span className="font-light relative top-[0.6px] text-[15px]">
                          {comment.likes.length}
                        </span>
                      </button>
                      <button
                        className="relative -top-[9px]"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                    {editingCommentId === comment.id && (
                      <div className=" relative -top-5 w-full">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) =>
                            setEditCommentContent(e.target.value)
                          }
                          className="border dark:border-teal-700 rounded-md p-2 w-full outline-none"
                        />
                        <div className="mt-2">
                          <button
                            className="bg-teal-800 text-white dark:text-customBlack px-3 py-1 rounded-lg mr-2"
                            onClick={() => {
                              handleEditComment(comment.id, editCommentContent);
                              setEditingCommentId(null);
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-500 dark:text-customBlack text-white px-2 py-1 rounded-lg"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {replyingTo === comment.id && (
                  <div className="flex flex-col relative -top-9 gap-2">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Reply..."
                      className="border dark:border-teal-700 rounded-md p-2 outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        className="w-20 p-1 rounded-lg text-white dark:text-customBlack bg-teal-800"
                        onClick={() => handleAddReply(comment.id)}
                      >
                        Reply
                      </button>
                      <button
                        className="w-20 p-1 rounded-lg text-white dark:text-customBlack bg-gray-600"
                        onClick={handleCancelReply}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {comment.replies.map((reply) => (
                  <>
                    <div key={reply.id} className="reply flex ml-10 mb-2">
                      <div>
                        <div className="w-[20px] h-[20px] rounded-[50%] cursor-pointer overflow-hidden flex justify-center items-center">
                          <Image
                            src={
                              reply.profilePicture ||
                              "/images/default-profile-image-2.jpg"
                            }
                            alt="avatar"
                            width={20}
                            height={20}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="h-5 border-teal-700 border-dashed border w-0 ml-[9px] mt-[1px] "></div>
                      </div>
                      <div className="flex flex-col">
                        <div className="relative flex pt-1 flex-col p-[10px] border dark:border-customGray rounded-lg mb-2 -mt-4 w-full">
                          {/* Ellipsis button and dropdown for replies */}
                          {user.uid !== reply.authorId && (
                            <div className="mb-3"></div>
                          )}
                          {user.uid === reply.authorId && (
                            <div className="relative ml-auto -mb-3">
                              <button
                                className="dark:text-gray-500 hover:text-gray-700 relative"
                                onClick={() =>
                                  setOpenMenuReplyId(
                                    openMenuReplyId === reply.id
                                      ? null
                                      : reply.id
                                  )
                                }
                              >
                                <FaEllipsis className="dark:hover:text-white transition-colors duration-200" />
                              </button>
                              {openMenuReplyId === reply.id && (
                                <div className="absolute right-0 mt-2 w-48 dark:bg-primary bg-customWhite3 border dark:border-customGray rounded-md shadow-lg z-10">
                                  <div className="py-1">
                                    <button
                                      className="block w-[95%] rounded-md m-auto text-left px-2 py-2 text-sm hover:text-white dark:text-gray-200 hover:bg-teal-800 transition-colors duration-200"
                                      onClick={() => {
                                        setEditingReplyId(reply.id);
                                        setEditReplyContent(reply.content);
                                        setOpenMenuReplyId(null);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="block w-[95%] rounded-md m-auto text-left px-2 py-2 text-sm hover:text-white dark:text-gray-200 hover:bg-teal-800 transition-colors duration-200"
                                      onClick={() => {
                                        handleDeleteReply(comment.id, reply.id);
                                        setOpenMenuReplyId(null);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <small className="dark:text-gray-300 text-gray-800">
                            <Link className="dark:hover:text-white hover:text-black" href={`/profile/${reply.authorId}`}>{reply.author}</Link> on{" "}
                            {formatDate(reply.createdAt)}
                          </small>
                          {editingReplyId === reply.id ? (
                            <div>
                              <textarea
                                value={editReplyContent}
                                onChange={(e) =>
                                  setEditReplyContent(e.target.value)
                                }
                                className="border dark:border-teal-700 rounded-md p-2 w-full outline-none mt-2"
                              />
                              <div className="mt-2">
                                <button
                                  className="bg-teal-800 text-white dark:text-customBlack px-3 py-1 rounded-lg mr-2"
                                  onClick={() =>
                                    handleEditReply(
                                      comment.id,
                                      reply.id,
                                      editReplyContent
                                    )
                                  }
                                >
                                  Save
                                </button>
                                <button
                                  className="bg-gray-500 dark:text-customBlack text-white px-2 py-1 rounded-lg"
                                  onClick={() => setEditingReplyId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 w-full tracking-normal text-[15px]">
                              {reply.content}
                            </p>
                          )}
                        </div>
                        {/* Like and reply button */}
                        <div className="flex items-center gap-7 mb-4">
                          <button
                            className={`mb-5 flex items-center gap-2 relative ${
                              reply.likes.includes(user?.uid)
                                ? "liked-reply"
                                : ""
                            }`}
                            onClick={() =>
                              handleLikeReply(
                                comment.id,
                                reply.id,
                                reply.likes.includes(user?.uid)
                              )
                            }
                          >
                            <span className="p-1 relative">
                              {reply.likes.includes(user?.uid) ? (
                                <FaHeart
                                  size={19}
                                  className="text-red-600 transition-all duration-200 ease-in-out"
                                />
                              ) : (
                                <Heart
                                  size={19}
                                  className="transition-all duration-200 ease-in-out"
                                />
                              )}
                            </span>
                            <span className="font-light text-[15px]">
                              {reply.likes.length}
                            </span>
                          </button>
                          <button
                            className="relative -top-[10px]"
                            onClick={() =>
                              setReplyingToReply({
                                commentId: comment.id,
                                replyId: reply.id,
                              })
                            }
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                        {/* Replying to a reply */}
                        {replyingToReply &&
                          replyingToReply.commentId === comment.id &&
                          replyingToReply.replyId === reply.id && (
                            <div className="flex flex-col gap-2 -mt-4 mb-10">
                              <textarea
                                value={newReplyToReply}
                                onChange={(e) =>
                                  setNewReplyToReply(e.target.value)
                                }
                                placeholder="Reply..."
                                className="border dark:border-teal-700 rounded-md p-2 outline-none"
                              />
                              <div className="flex items-center gap-3">
                                <button
                                  className="w-20 p-1 rounded-lg text-white dark:text-customBlack bg-teal-800"
                                  onClick={() =>
                                    handleReplyToReply(comment.id, reply.id)
                                  }
                                >
                                  Reply
                                </button>
                                <button
                                  className="w-20 p-1 rounded-lg text-white dark:text-customBlack bg-gray-600"
                                  onClick={() => setReplyingToReply(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                ))}
              </div>
            ))}
          </div>
        </div>
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePost}
          message="Are you sure you want to delete this post?"
        />
      </div>
    </>
  );
};

export default FullPostView;
