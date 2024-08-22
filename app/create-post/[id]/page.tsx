"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/src/libs/firebase";
import ContentEditor from "@/app/_components/ContentEditor";

const CreatePost = () => {
  const { user, loading } = useRequireAuth();

  const params = useParams();

  const [postStatus, setPostStatus] = useState<
    "draft" | "published" | undefined
  >(undefined);
  const [fetchingStatus, setFetchingStatus] = useState(false);

   useEffect(() => {
     const fetchPostStatus = async () => {
       if (params.id && user) {
         setFetchingStatus(true);
         try {
           const postRef = doc(firestore, "Posts", params.id as string);
           const postSnap = await getDoc(postRef);
           if (postSnap.exists()) {
             const postData = postSnap.data();
             setPostStatus(postData.status as "draft" | "published");
           }
         } catch (error) {
           console.error("Error fetching post status:", error);
         } finally {
           setFetchingStatus(false);
         }
       }
     };

     fetchPostStatus();
   }, [params.id, user]);

  if (loading || fetchingStatus) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to create a post.</div>;
  }

  return (
    <ContentEditor userId={user.uid} postId={params.id as string} postStatus={postStatus} />
  );
};

export default CreatePost;
