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
import { getDoc, doc, Timestamp } from "firebase/firestore";
import { firestore } from "@/src/libs/firebase";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Image from "next/image";
import Link from "next/link";
import ContentPreview from "./ContentPreview";
import ConfirmModal from "./ConfirmModal";
import { algoliaPostsIndex } from "@/src/libs/algoliaClient";


const FullPostView: FC = () => {
  const { user } = useRequireAuth();
  const params = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState('');
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const router = useRouter();

  const { getPostById, deletePost } = postFuncs();
  const { likePost, unlikePost } = likeFuncs();
  const { addComment, getComments, updateComment, deleteComment, addReply, likeComment, unlikeComment } = commentFuncs();
  const { followUser, unfollowUser, isFollowingUser } =
    ImplementFollowersFuncs();

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
        } else {
          console.log("No such post!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };


    const fetchAuthorName = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(firestore, "Users", user.uid));
      if (userDoc.exists()) {
        setAuthorName(userDoc.data().fullname || "Anonymous");
      }
    };

    fetchPost();
    fetchAuthorName();
  }, [params.id, user]);


  const handleLike = async () => {
    if (!user || !post) return;
    try {
      if (isLiked) {
        await unlikePost(user.uid, post.id);
      } else {
        await likePost(user.uid, post.id);
      };
      setIsLiked(!isLiked);
      setPost(prevPost => prevPost ? { ...prevPost, likes: isLiked ? prevPost.likes.filter(id => id !== user.uid) : [...prevPost.likes, user.uid] } : null);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !post) return;
    
    try {
      await deletePost(post.id);
      await algoliaPostsIndex.deleteObject(post.id)
      setSuccessMessage('Post deleted')
      setTimeout(() => {
        setSuccessMessage('');
        router.push('/feeds')
      }, 1000)
    } catch (error) {
      console.error("Error deleting Post:", error);
      setError('Failed to delete')
      setTimeout(() => {
        setError('')
      }, 1000);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  }

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
      console.error('Error following/unfollowing user:', error);
    }
  };

   const handleAddComment = async () => {
     if (!user || !post) return;
     try {
       const newCommentObj = await addComment(
         post.id,
         user.uid,
         newComment,
         authorName
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
      setComments(prevComments => prevComments.map(comment => comment.id === commentId ? { ...comment, content: newContent } : comment));
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!user || !post) return;
    try {
      const newReplyObj = await addReply(
        post.id,
        commentId,
        user.uid,
        newReply,
        authorName
      );
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReplyObj] }
            : comment
        )
      );
      console.log(setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReplyObj] }
            : comment
        )
      ))
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
     <div className="full-post-container h-screen overflow-y-scroll">
       <Link href="/feeds">
         <button className="back-btn">Back to feed</button>
       </Link>
       {user && post && user.uid === post.authorId && (
         <button onClick={openDeleteModal} className="delete-post-tbn">
           Delete post
         </button>
       )}
       <ContentPreview
         title={post.title}
         content={post.content}
         tags={post.tags}
         coverImageUrl={post.coverImage}
         authorName={post.author}
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
         <button onClick={handleLike}>
           {isLiked ? "Unlike" : "Like"} ({post.likes.length})
         </button>
         {user &&
           post &&
           !isOwnPost && (
             <button onClick={handleFollow} className="follow-btn">
               {isFollowing ? "Unfollow Author" : "Follow Author"}
             </button>
           )}
       </div>
       <div className="comments-section">
         <h3>Comments</h3>
         <textarea
           value={newComment}
           onChange={(e) => setNewComment(e.target.value)}
           placeholder="Add a comment..."
         />
         <button onClick={handleAddComment}>Post Comment</button>
         {comments.map((comment) => (
           <div key={comment.id} className="comment">
             <p>{comment.content}</p>
             <small>
               By: {comment.author} on{" "}
               {new Date(comment.createdAt).toLocaleDateString()}
             </small>
             <button
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
             <button onClick={() => setReplyingTo(comment.id)}>Reply</button>
             {replyingTo === comment.id && (
               <div>
                 <textarea
                   value={newReply}
                   onChange={(e) => setNewReply(e.target.value)}
                   placeholder="Add a reply..."
                 />
                 <button onClick={() => handleAddReply(comment.id)}>
                   Post Reply
                 </button>
               </div>
             )}
             {comment.replies.map((reply) => (
               <div key={reply.id} className="reply">
                 <p>{reply.content}</p>
                 <small>
                   By: {reply.author} on{" "}
                   {new Date(reply.createdAt).toLocaleDateString()}
                 </small>
                 <button
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
             ))}
           </div>
         ))}
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
