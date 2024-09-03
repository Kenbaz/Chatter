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
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Image from "next/image";
import Link from "next/link";
import { Timestamp, FieldValue } from "firebase/firestore";
import ConfirmModal from "./ConfirmModal";
import { algoliaPostsIndex } from "@/src/libs/algoliaClient";
import { analyticsFuncs } from "@/src/libs/contentServices";
import BookmarkButton from "./BookmarkButton";
import {
  FaHeartCircleMinus,
  FaHeartCirclePlus,
  FaComment,
  FaEllipsis,
} from "react-icons/fa6";
import ShareButtons from "./ShareButtons";
import "prismjs/themes/prism-tomorrow.css";
import { Heart, MessageCircle } from 'lucide-react';

type FullPostViewProps = {
  postId: string;
};


const FullPostView: FC<FullPostViewProps> = ({ postId }) => {
  const { user } = useRequireAuth();
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
      <h1 className="text-3xl text-white font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl text-white font-bold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl text-white font-bold my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg text-white font-bold my-2" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-base text-white font-bold my-1" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-sm text-white font-bold my-1" {...props} />
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

  function formatDate(
    date: string | number | Date | Timestamp | FieldValue | undefined
  ): string {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    } else if (date instanceof Date) {
      return date.toLocaleDateString();
    } else if (typeof date === "string" || typeof date === "number") {
      return new Date(date).toLocaleDateString();
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

  if (loading) return <div>Loading...</div>;
  if (!user) return;
  if (!post) return <div>Post not found</div>;

  if (post.status === "draft") {
    return (
      <div className="full-post-container mt-14 relative h-auto pb-10 md:w-[91%] md:m-auto md:mt-14">
        <div className="full-post-content dark:bg-primary max-w-4xl mx-auto">
          <div className="p-2">
            {post.coverImage && (
              <div className="relative w-full aspect-[16/8] mb-5">
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
                  className="text-white hover:text-gold4"
                  onClick={() => handleEditPost(post.id)}
                >
                  Edit
                </button>
                <button
                  onClick={openDeleteModal}
                  className="delete-post-btn text-white hover:text-red-600"
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
                  <p className="text-tinWhite font-semibold text-base tracking-wide">
                    {authorName}
                  </p>
                </Link>
                <small className="text-red-600 text-[14px]">
                  This draft can only be seen by you.
                </small>
              </div>
            </div>
            <h1 className="text-3xl text-white font-bold mb-4">{post.title}</h1>
            <div className="mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full bg-gray-200 mr-2 px-3 py-1 text-sm font-semibold text-gray-800 mb-2"
                >
                  <span className="text-teal-700">#</span>
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
      <div className="full-post-container mt-14 relative h-auto pb-12 md:w-[79%] md:m-auto md:mt-16 lg:landscape:w-[70%] lg:mt-16 lg:w-[70%]">
        {post && (
          <div className="full-post-content dark:bg-primary max-w-4xl mx-auto rounded-md xl:w-[80%] 2xl:w-[80%]">
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
                  className="text-white hover:text-gold4"
                  onClick={() => handleEditPost(post.id)}
                >
                  Edit
                </button>
                <button
                  onClick={openDeleteModal}
                  className="delete-post-btn text-white hover:text-red-600"
                >
                  Delete post
                </button>
                <button
                  onClick={() => handleViewAnalytics(post.id)}
                  className="view-analytics-btn text-white hover:text-gold4"
                >
                  Stats
                </button>
              </div>
            )}
            {user && post && !isOwnPost && (
              <button
                onClick={handleFollow}
                className="text-[15px] relative dark:bg-gray-200 px-2 w-[23%] md:w-[15%] md:left-[80%] font-semibold text-gray-900 left-[75%] p-1 rounded-md"
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
                    <p className="text-tinWhite font-semibold text-base tracking-wide">
                      {authorName}
                    </p>
                  </Link>
                  <small className="text-gray-600 text-[14px]">
                    Published on {formatDate(post.createdAt)}
                  </small>
                </div>
              </div>
              <h1 className="text-3xl text-white font-bold mb-4">
                {post.title}
              </h1>
              <div className="mb-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block rounded-full mr-2 bg-customGray1 px-3 py-1 text-sm font-semibold text-gray-200 mb-2"
                  >
                    <span className="text-gray-400">#</span>
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
          <div className="flex items-center w-full p-4 bg-headerColor justify-around fixed z-50 bottom-0 md:w-[10%] md:flex-col md:h-[30%] md:left-0 md:top-16 lg:landscape:w-[10%] lg:landscape:flex-col lg:landscape:h-[50%] lg:landscape:left-10 lg:landscape:top-14 lg:w-[10%] lg:flex-col lg:h-[30%] lg:left-7 lg:top-16 xl:hidden">
            <button
              className="like-button relative flex items-center gap-2 lg:flex-col md:flex-col"
              onClick={handleLike}
            >
              <span className="text-2xl">
                {isLiked ? (
                  <Heart className="text-red-500 transition-all duration-200 ease-in-out cursor-pointer" />
                ) : (
                  <Heart className="cursor-pointer" />
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
                  <div className="share-buttons-container w-[95.5%] h-[25%] top-[64.4%] fixed z-20 right-[10px] mt-2 border-customGray bg-white dark:bg-primary border rounded shadow-lg p-2 md:top-[22rem] md:w-[30%] md:left-[5rem] md:h-[20%] lg:landscape:left-[7rem] lg:landscape:top-[19rem] lg:landscape:h-[30%] lg:landscape:w-[25%] lg:left-[7rem] lg:top-[25rem] xl:hidden">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      coverImageUrl={post.coverImage}
                    />
                  </div>
                  <div className="share-buttons-container hidden xl:block xl:fixed xl:w-[20%] xl:z-20 xl:h-[25%] xl:left-[8rem] xl:top-[25rem] border border-customGray rouned-md bg-primary shadow-lg p-2 ">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      coverImageUrl={post.coverImage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden xl:flex xl:fixed xl:w-[10%] xl:h-[45%] xl:justify-around xl:z-50 xl:left-[9rem] xl:top-[5rem] xl:flex-col xl:items-center xl:p-4 2xl:left-[14rem] 2xl:top-[6rem] 2xl:w-[5%] bg-headerColor">
            <button
              className="like-button relative flex items-center gap-2 lg:flex-col md:flex-col"
              onClick={handleLike}
            >
              <span className="text-2xl">
                {isLiked ? (
                  <Heart className="text-red-500 transition-all duration-200 ease-in-out cursor-pointer" />
                ) : (
                  <Heart className="cursor-pointer" />
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
                  <div className="share-buttons-container w-[95.5%] h-[25%] top-[64.4%] fixed z-20 right-[10px] mt-2 border-customGray bg-white dark:bg-primary border rounded shadow-lg p-2 md:top-[22rem] md:w-[30%] md:left-[5rem] md:h-[20%] lg:landscape:left-[7rem] lg:landscape:top-[19rem] lg:landscape:h-[30%] lg:landscape:w-[25%] lg:left-[7rem] lg:top-[25rem] xl:hidden">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      coverImageUrl={post.coverImage}
                    />
                  </div>
                  <div className="share-buttons-container rounded-md hidden xl:block xl:fixed xl:w-[20%] xl:z-20 xl:h-[25%] xl:left-[14.3rem] xl:top-[24.5rem] 2xl:left-[18rem] 2xl:top-[23.5rem] border border-customGray rouned-md bg-primary shadow-lg p-2 ">
                    <ShareButtons
                      postId={post.id}
                      postTitle={post.title}
                      coverImageUrl={post.coverImage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="comments-section p-2 mt-2 pb-[60px] dark:bg-primary md:pr-36 md:pl-10 xl:w-[80%] xl:m-auto xl:mt-3 2xl:w-[80%] 2xl:rounded-md ">
          <h3 className="dark:text-white xl:text-xl xl:pb-2 mb-4 font-semibold">
            Comments
          </h3>
          <div className="flex flex-col gap-2 mb-10">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="border border-teal-700 rounded-md p-2 outline-none"
            />
            <button
              className="w-20 p-1 rounded-lg bg-teal-800"
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
                  <div className="comment-box relative">
                    <div className="flex relative flex-col p-[10px] border border-customGray rounded-lg mb-2 -mt-6">
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
                            <FaEllipsis className="hover:text-white transition-colors duration-200" />
                          </button>
                          {openMenuCommentId === comment.id && (
                            <div className="absolute right-0 mt-2 w-48 dark:bg-primary border dark:border-customGray rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  className="block w-[95%] rounded-md m-auto text-left px-2 py-2 text-sm dark:text-gray-200 hover:bg-teal-800 transition-colors duration-200"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentContent(comment.content);
                                    setOpenMenuCommentId(null);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="block w-[95%] rounded-md m-auto text-left px-2 py-2 text-sm dark:text-gray-200 hover:bg-teal-800 transition-colors duration-200"
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
                        <small className="dark:text-gray-400">
                          {comment.author} on{" "}
                          {new Date(comment.createdAt).toLocaleDateString()}
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
                            <Heart
                              size={20}
                              className="text-red-500 transition-all duration-200"
                            />
                          ) : (
                            <Heart
                              size={20}
                              className="text-[20px] transition-all duration-200"
                            />
                          )}
                        </span>
                        <span className="font-light relative top-[0.6px] text-[15px]">
                          {comment.likes.length}
                        </span>
                      </button>
                      <button
                        className="relative -top-[6.8px]"
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
                          className="border border-teal-700 rounded-md p-2 w-full outline-none"
                        />
                        <div className="mt-2">
                          <button
                            className="bg-teal-800 px-3 py-1 rounded-lg mr-2"
                            onClick={() => {
                              handleEditComment(comment.id, editCommentContent);
                              setEditingCommentId(null);
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-500 px-2 py-1 rounded-lg"
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
                      className="border border-teal-700 rounded-md p-2 outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        className="w-20 p-1 rounded-lg bg-teal-800"
                        onClick={() => handleAddReply(comment.id)}
                      >
                        Reply
                      </button>
                      <button
                        className="w-20 p-1 rounded-lg bg-gray-600"
                        onClick={handleCancelReply}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="reply">
                    <div className="flex mb-3 ml-5">
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
                      </div>
                      <div>
                        <div>
                          <div className="flex flex-col p-[10px] border border-customGray rounded-lg mb-2 -mt-4">
                            <small>
                              {reply.author} on{" "}
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </small>
                            <p className="mt-3 w-full tracking-normal text-[15px]">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`mb-5 flex items-center gap-2 relative ${
                            reply.likes.includes(user?.uid) ? "liked-reply" : ""
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
                              <FaHeartCircleMinus className="text-red-500 text-[20px]" />
                            ) : (
                              <FaHeartCirclePlus className="text-[20px]" />
                            )}
                          </span>
                          <span className="font-light text-[15px]">
                            {reply.likes.length}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
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
