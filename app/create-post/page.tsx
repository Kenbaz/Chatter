'use client'

import ContentEditor from "../_components/ContentEditor";
import ContentEditorSkeleton from "../_components/skeletons/ContentEditorSkeleton";
import { useAuthentication } from "../_components/AuthContext";

const CreatePost = () => {
  const { user, loading } = useAuthentication();

    if (loading) {
        return <ContentEditorSkeleton/>
    }

  if (!user) {
    return <div></div>;
  }

  return <ContentEditor userId={user.uid} />;
};

export default CreatePost;
