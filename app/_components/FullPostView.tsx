"use client";

import { useEffect, FC, useState } from "react";
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
import { FaHeartCircleMinus, FaHeartCirclePlus, FaComment } from "react-icons/fa6";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

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
      const button = document.querySelector('.like-button');
      button?.classList.add('animating');
      setTimeout(() => button?.classList.remove('animating'), 500)

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
    if (!user || !post) return;
    try {
      const currentUserName = await fetchAuthorName(user.uid);
       const profilePicture = await getUserProfilePicture(user.uid);
      const newCommentObj = await addComment(
        post.id,
        user.uid,
        newComment,
        currentUserName,
        profilePicture
      );
      setComments((prevComments) => [...prevComments, newCommentObj]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      await updateComment(commentId, newContent);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: newContent }
            : comment
        )
      );
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleViewAnalytics = (postId: string) => {
    router.push(`/stats/${postId}`);
  };

  const handleAddReply = async (commentId: string) => {
    if (!user || !post) return;
    try {
      const currentUserName = await fetchAuthorName(user.uid);
      const profilePicture = await getUserProfilePicture(user.uid);
      const newReplyObj = await addReply(
        post.id,
        commentId,
        user.uid,
        newReply,
        currentUserName,
        profilePicture,
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
      console.log(newReply);
      setNewReply("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
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
          <div className="flex items-center gap-2">
            <FaComment className="text-xl" />
            <span className="font-light">{post.comments.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton postId={post.id} userId={user.uid} />
            <span className="font-light">{post.bookmarks.length}</span>
          </div>
        </div>
        <div className="absolute z-50 top-[220px] text-[15px] border-teal-700 text-teal-400 right-2 border p-1 rounded-lg">
          {user && post && !isOwnPost && (
            <button onClick={handleFollow} className="follow-btn">
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>
      <div className="comments-section p-2 mt-2 bg-primary">
        <h3 className="text-white mb-4 font-semibold">Comments</h3>
        <div className="flex flex-col gap-2 mb-10">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="border border-teal-700 rounded-md p-2"
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
                  <div className="h-10 border-dashed border w-1 ml-2 "></div>
                </div>
                <div>
                  <div className="flex flex-col p-[10px] border border-customGray rounded-lg mb-2 -mt-4">
                    <div className="">
                      <small className="text-gray-400">
                        {comment.author} on{" "}
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </small>
                      <p className="mt-3 w-full tracking-normal text-[15px]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  <button
                    className="mb-4"
                    onClick={() =>
                      handleLikeComment(
                        comment.id,
                        comment.likes.includes(user?.uid)
                      )
                    }
                  >
                    {comment.likes.includes(user?.uid) ? "Unlike" : "Like"} (
                    {comment.likes.length})
                  </button>
                  <button onClick={() => setReplyingTo(comment.id)}>
                    Reply
                  </button>
                </div>
              </div>

              {replyingTo === comment.id && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Reply..."
                    className="border border-teal-700 rounded-md p-2"
                  />
                  <button
                    className="w-20 p-1 rounded-lg bg-teal-800"
                    onClick={() => handleAddReply(comment.id)}
                  >
                    Reply
                  </button>
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
                        className="mb-5"
                        onClick={() =>
                          handleLikeComment(
                            reply.id,
                            reply.likes.includes(user?.uid)
                          )
                        }
                      >
                        {reply.likes.includes(user?.uid) ? "Unlike" : "Like"} (
                        {reply.likes.length})
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
