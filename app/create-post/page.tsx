'use client'

import { useRequireAuth } from "@/src/libs/useRequireAuth";
import ContentEditor from "../_components/ContentEditor";
import ContentEditorSkeleton from "../_components/skeletons/ContentEditorSkeleton";

const CreatePost = () => {
    const { user, loading } = useRequireAuth();

    if (loading) {
        return <ContentEditorSkeleton/>
    }

  if (!user) {
    return <div>Please log in to create a post.</div>;
  }

  return <ContentEditor userId={user.uid} />;
};

export default CreatePost;
