'use client'

import { useRequireAuth } from "@/src/libs/useRequireAuth";
import ContentEditor from "../_components/ContentEditor";

const CreatePost = () => {
    const { user, loading } = useRequireAuth();

    if (loading) {
        return <div>Loading...</div>
    }

  if (!user) {
    return <div>Please log in to create a post.</div>;
  }

  return <ContentEditor userId={user.uid} />;
};

export default CreatePost;
