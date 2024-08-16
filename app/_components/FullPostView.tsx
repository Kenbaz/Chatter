"use client";

import { useEffect, FC, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

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
import ContentPreview from "./ContentPreview";
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

const FullPostView: FC = () => {
  const { user } = useRequireAuth();
  const params = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReplyLiked, setIsReplyLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id || !user) return;

      try {
        const postData = await getPostById(params.id as string);
        if (postData) {
          setPost(postData);
          setIsLiked(postData.likes?.includes(user.uid) || false);
          setComments(postData.comments || []);
          const following = await isFollowingUser(user.uid, postData.authorId);
          setIsFollowing(following);
          setIsOwnPost(user.uid === postData.authorId);

          const name = await fetchAuthorName(postData.authorId);
          setAuthorName(name);

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
  }, [params.id, user]);

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

  return (
    <div className="full-post-container relative h-screen">
      <Link href="/feeds">
        <button className="back-btn hidden lg:block">Back to feed</button>
      </Link>
      <div className="absolute p-2 z-50 top-[200px] right-2 font-light text-[15px] mt-1 flex gap-4">
        {user && post && user.uid === post.authorId && (
          <>
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
          </>
        )}
      </div>

      <ContentPreview
        title={post.title}
        authorId={post.authorId}
        content={post.content}
        tags={post.tags}
        coverImageUrl={post.coverImage}
        authorName={authorName}
        publishDate={new Date().toLocaleDateString()}
      />
      {/* <div className="post-tags">
         {post.tags.map((tag) => (
           <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
             <span className="tag">{tag}</span>
           </Link>
         ))}
       </div> */}
      <div className="post-actions">
        <div className="flex items-center w-full p-4 bg-headerColor justify-around fixed z-50 bottom-0">
          <button
            className="like-button relative flex items-center gap-2"
            onClick={handleLike}
          >
            <span className="text-2xl">
              {isLiked ? (
                <FaHeartCircleMinus className="text-red-500 transition-all duration-200 ease-in-out" />
              ) : (
                <FaHeartCirclePlus />
              )}
            </span>
            <span className="font-light">{post.likes.length}</span>
            <span className="like-animation absolute inset-0"></span>
          </button>
          <div className="flex items-center gap-2" onClick={handleCommentClick}>
            <FaComment className="text-xl" />
            <span className="font-light">{post.comments.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton postId={post.id} userId={user.uid} onBookmarkChange={updateBookmarkCount} />
            <span className="font-light">
              {bookmarkCount}
            </span>
          </div>
        </div>

        {user && post && !isOwnPost && (
          <button
            onClick={handleFollow}
            className="absolute z-50 top-[220px] text-[15px] dark:bg-gray-200 font-semibold text-gray-900 right-2 p-1 rounded-lg"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
      <div className="comments-section p-2 mt-2 pb-[50px] dark:bg-primary">
        <h3 className="dark:text-white mb-4 font-semibold">Comments</h3>
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
            <div key={comment.id} className="comment">
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
                          <FaEllipsis />
                        </button>
                        {openMenuCommentId === comment.id && (
                          <div className="absolute right-0 mt-2 w-48 dark:bg-primary border dark:border-customGray rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm dark:text-gray-200 hover:bg-gray-800"
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentContent(comment.content);
                                  setOpenMenuCommentId(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
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
                        comment.likes.includes(user?.uid) ? "liked-comment" : ""
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
                          <FaHeartCircleMinus className="text-red-500 text-[20px]" />
                        ) : (
                          <FaHeartCirclePlus className="text-[20px]" />
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
                      <FaComment />
                    </button>
                  </div>
                  {editingCommentId === comment.id && (
                    <div className=" relative -top-5 w-full">
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="border border-teal-700 rounded-md p-2 w-full outline-none"
                      />
                      <div className="mt-2">
                        <button
                          className="bg-teal-800 p-1 rounded-lg mr-2"
                          onClick={() => {
                            handleEditComment(comment.id, editCommentContent);
                            setEditingCommentId(null);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-500 p-1 rounded-lg"
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
  );
};

export default FullPostView;
