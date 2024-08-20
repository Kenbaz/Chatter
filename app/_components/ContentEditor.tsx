"use client";

import React, {
  useState,
  useEffect,
  FC,
  useCallback,
  useRef,
  ChangeEvent,
} from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import Image from "next/image";
import { storage, firestore } from "@/src/libs/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import { setLoading } from "../_store/loadingSlice";
import { useAuth } from "@/src/libs/authServices";
import { auth } from "@/src/libs/firebase";
import { setError, clearError } from "../_store/errorSlice";
import ContentPreview from "./ContentPreview";
import "react-markdown-editor-lite/lib/index.css";
import { tagFuncs } from "@/src/libs/contentServices";
import { Comment } from "@/src/libs/contentServices";
import { algoliaPostsIndex } from "@/src/libs/algoliaClient";
import { useRouter } from "next/navigation";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

interface ContentEditorProps {
  userId: string;
  postId?: string;
}

interface LocalContent {
  title: string;
  content: string;
  tags: string[];
  coverImage: string;
}

interface Tag {
  id: string;
  name: string;
}

interface PostData {
  title: string;
  tags: string[];
  content: string;
  authorId: string;
  author: string,
  status: string;
  coverImage: string;
  updatedAt: string | FieldValue | Timestamp;
  createdAt?: string | Timestamp;
  likes: string[];
  comments: Comment[],
}

const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

const ContentEditor: FC<ContentEditorProps> = ({ userId, postId }) => {
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.error);
  const {isLoading} = useSelector((state: RootState) => state.loading);

  const { signOutUser } = useAuth();
  const router = useRouter();

  const [localContent, setLocalContent] = useLocalStorage<LocalContent>(
    `content_${userId} `,
    {
      title: "",
      content: "",
      tags: [],
      coverImage: "",
    }
  );

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    localContent.coverImage
  );
  const [title, setTitle] = useState(localContent.title);
  const [selectedTags, setSelectedTags] = useState<string[]>(localContent.tags);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [content, setContent] = useState(localContent.content);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
   const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
   const [tagColors, setTagColors] = useState<Record<string, string>>({});

  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const INITIAL_EDITOR_HEIGHT = "370px";
  const FULL_SCREEN_THRESHOLD = 0;

  const [editorHeight, setEditorHeight] = useState(INITIAL_EDITOR_HEIGHT);

  useEffect(() => {
    const fetchTags = async () => {
      const allTags = await tagFuncs().getAllTags();
      setAvailableTags(allTags);

      // Generate random colors for hashtags
      const colors = allTags.reduce((acc, tag) => {
        acc[tag.id] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        return acc;
      }, {} as Record<string, string>);
      setTagColors(colors);
    };

    fetchTags();
  }, []);

  const handleTagSelect = (tag: Tag) => {
    setSelectedTags((prev) => {
      let newTags;
      if (prev.includes(tag.id)) {
        newTags = prev.filter((id) => id !== tag.id);
      } else if (prev.length < 3) {
        newTags = [...prev, tag.id];
      } else {
        // If already 3 tags selected, don't add more
        return prev;
      }
      setLocalContent((prevContent) => ({ ...prevContent, tags: newTags }));
      return newTags;
    });
  };

  const toggleTagDropdown = () => {
    setIsTagDropdownOpen(!isTagDropdownOpen);
  };

  useEffect(() => {
    const tagNames = selectedTags
      .map((tagId) => availableTags.find((tag) => tag.id === tagId)?.name || "")
      .filter((name) => name !== "");
    setSelectedTagNames(tagNames);
  }, [selectedTags, availableTags]);


  useEffect(() => {
    const fetchPostData = async (id: string) => {
      try {
        const docRef = doc(firestore, "Posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const postData = docSnap.data();
          setTitle(postData.title);
          setContent(postData.content);
          setSelectedTags(postData.tags);
          setCoverImageUrl(postData.coverImage);
          dispatch(clearError());
        } else {
          console.log("No such document");
          dispatch(setError("Post not found"));
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        dispatch(setError("Failed to load data"));
      }
    };

    if (postId) {
      fetchPostData(postId);
    }

    const fetchAuthorName = async () => {
      const userDoc = await getDoc(doc(firestore, "Users", userId));
      if (userDoc.exists()) {
        setAuthorName(userDoc.data().fullname || "Anonymous");
      }
    };
    fetchAuthorName();
    setPublishDate(new Date().toLocaleDateString());
  }, [postId, dispatch, userId]);

  const clearLocalStorage = useCallback(() => {
    setLocalContent({
      title: "",
      content: "",
      tags: [],
      coverImage: "",
    });
  }, [setLocalContent]);

  const handleCoverImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      dispatch(setLoading(true));
      setCoverImageFile(file);
      const storageRef = ref(storage, `Cover_images/${file.name}`);
      const snapShot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapShot.ref);
      setCoverImageUrl(url);
      setLocalContent((prev) => ({ ...prev, coverImage: url }));
      dispatch(clearError());
    } catch (error) {
      console.error("Error uploading cover image:", error);
      dispatch(setError("Please select file"));
    } finally {
      setIsUploading(false);
      dispatch(setLoading(false));
    }
  };

  const handleSetCoverImage = () => {
    console.log("Setting cover image");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      console.log("File input changed");
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        console.log("File selected:", file.name);
        handleCoverImageUpload(file);
      } else {
        console.log("No file selected");
      }
    };
    input.click();
  };

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text);
    setLocalContent((prev) => ({ ...prev, content: text }));
    checkFullScreen(text);
    scrollToBottom();
  };

  const handleRemoveCoverImage = () => {
    setCoverImageUrl("");
    setLocalContent({
      coverImage: "",
      title: title,
      content: content,
      tags: selectedTags,
    });
  };

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setLocalContent((prev) => ({ ...prev, title: newTitle }));

     e.target.style.height = "auto";
     e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      dispatch(setError("Please enter a title for your post"));
      return false;
    }
    if (!content.trim()) {
      dispatch(setError("Please enter some content for your post"));
      return false;
    }
    return true;
  };

  const savePost = async (publish: boolean = false) => {
    if (!auth.currentUser) {
      dispatch(setError("Sign in to save a post"));
      return;
    }
    dispatch(setLoading(true));
    if (!validateForm()) {
      dispatch(setLoading(false));
      return;
    }

    const postData: PostData = {
      title,
      tags: selectedTagNames,
      content,
      authorId: userId,
      author: authorName,
      status: publish ? "published" : "draft",
      coverImage: coverImageUrl,
      updatedAt: Timestamp.now(),
      likes: [],
      comments: [],
    };

    try {
      const postRef = postId
        ? doc(firestore, "Posts", postId)
        : doc(collection(firestore, "Posts"));

      if (!postId) {
        postData.createdAt = Timestamp.now();
      }

      await setDoc(postRef, postData, { merge: true });

      // sync with algolia
      const algoliaObject = {
        objectID: postRef.id,
        title: postData.title,
        authorId: postData.authorId,
        author: postData.author,
        updatedAt: new Date().toISOString(),
        createdAt: postData.createdAt ? new Date().toISOString() : undefined,
      };
      await algoliaPostsIndex.saveObject(algoliaObject);

      // Clear local storage after a successful save
      clearLocalStorage();

      setSuccessMessage(
        `${publish ? "Post published successfully" : "Draft saved"}`
      );
      dispatch(setLoading(false));
      dispatch(clearError());

      if (publish) {
        router.push(`/post/${postRef.id}`);
      };

    } catch (error) {
      dispatch(setError("Error saving post"));
      console.error("Error saving post:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const discardPost = () => {
    // Clear local storage
    clearLocalStorage();

    // Reset all state variables
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setCoverImageUrl("");

    setSuccessMessage("Post discarded");
  };

  const togglePreview = () => setIsPreview(!isPreview);

  const handleImageUpload = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `Post_images/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  };

  const handleVideoUpload = (files: File | File[]): Promise<string[]> => {
    const fileArray = Array.isArray(files) ? files : [files];

    return Promise.all(
      fileArray.map(async (file) => {
        const storageRef = ref(storage, `Post_videos/${file.name}`);
        const snapShot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapShot.ref);
      })
    );
  };

  const scrollToBottom = useCallback(() => {
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector("textarea");
      if (textarea) {
        setTimeout(() => {
          textarea.scrollTop = textarea.scrollHeight;
        }, 0);
      }
    }
  }, []);

  const checkFullScreen = useCallback(
    (text: string) => {
      if (text.length > FULL_SCREEN_THRESHOLD && !isFullScreen) {
        setIsFullScreen(true);
        const vh = window.innerHeight;
        setEditorHeight(`${vh}px`);
        if (editorRef.current) {
          editorRef.current.scrollIntoView({ behavior: "smooth" });
          setTimeout(scrollToBottom, 300);
        }
      } else if (text.length <= FULL_SCREEN_THRESHOLD && isFullScreen) {
        setIsFullScreen(false);
        setEditorHeight(INITIAL_EDITOR_HEIGHT);
        if (contentRef.current) {
          contentRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [isFullScreen, scrollToBottom]
  );

  useEffect(() => {
    if (isFullScreen) {
      scrollToBottom();
    }
  }, [isFullScreen, scrollToBottom]);

  return (
    <>
      <header className="h-14 flex items-center justify-end bg-headerColor fixed w-full top-0 z-50">
        <button
          onClick={togglePreview}
          className="text-tinWhite z-50 text-[15px] px-2 mr-4 py-2 rounded-lg preview-btn hover:bg-teal-700 hover:opacity-95"
        >
          Preview
        </button>
      </header>
      <div className="max-w-4xl mt-14 pb-10 relative mx-auto p-4">
        {isPreview ? (
          <div className="fixed inset-0 z-50 overflow-auto">
            <ContentPreview
              title={title}
              content={content}
              tags={selectedTagNames}
              coverImageUrl={coverImageUrl}
              authorName={authorName}
              publishDate={publishDate}
            />
            <button
              onClick={togglePreview}
              className="absolute top-48 right-4 hover:bg-teal-700 hover:opacity-95 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          </div>
        ) : (
          <>
            <div
              ref={contentRef}
              className="mr-4 mb-4 overflow-y-auto w-full content-ref h-[610px]"
            >
              {successMessage && (
                <div className=" px-4 py-3 rounded relative mb-2" role="alert">
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <button
                onClick={handleSetCoverImage}
                className="border border-primary text-tinWhite hover:border-primary px-4 p-2 rounded-lg mr-4 mb-4"
                disabled={isUploading}
              >
                Set cover image
              </button>
              {isUploading && (
                <div className="flex items-center text-sm space-x-2 mb-4">
                  <span className="text-[14px]">Uploading</span>
                  <div className="animate-spin rounded-[50%] h-3 w-3 border-t-2 border-b-2 border-teal-500 "></div>
                </div>
              )}
              {coverImageUrl && (
                <div className="relative w-[150px] h-[70px] mb-4">
                  <Image
                    src={coverImageUrl}
                    alt="Cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                  <button
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 left-44 px-3 text-sm bg-red-500 text-white rounded-full py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="mb-6 w-full p-2 pb-4">
                <textarea
                  placeholder="Title..."
                    value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-headerColor text-2xl border-none -mb-7 font-bold text-tinWhite outline-none focus:ring-0 placeholder-gray-300 resize-none h-full overflow-hidden"
                />
              </div>
              <div className="mb-6 relative">
                <div
                  onClick={toggleTagDropdown}
                  className="w-full p-2 mb-4  rounded bg-headerColor outline-none cursor-pointer text-tinWhite"
                >
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 ">
                      {selectedTags.map((tagId) => {
                        const tag = availableTags.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tag.id}
                            className="bg-gray-800 rounded-full px-2 py-1 text-sm"
                          >
                            <span style={{ color: tagColors[tag.id] }}>#</span>
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    "Select Tags (max 3)"
                  )}
                </div>
                {isTagDropdownOpen && (
                  <div className="tag-dropdown w-full mt-1 h-[250px] overflow-y-scroll border-none rounded shadow-lg">
                    <div className="mb-4 border p-2 border-t-0 border-l-0 border-r-0 border-gray-800 text-cyan-800">
                      Tags
                    </div>
                    {availableTags.map((tag) => (
                      <div
                        key={tag.id}
                        onClick={() => handleTagSelect(tag)}
                        className={`p-2 mb-2 rounded-lg hover:rounded-lg hover:text-cyan-800 hover:bg-gray-800 cursor-pointer ${
                          selectedTags.includes(tag.id)
                            ? "bg-gray-800 text-cyan-800"
                            : ""
                        } text-tinWhite`}
                      >
                        <span style={{ color: tagColors[tag.id] }}>#</span>
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                ref={editorRef}
                className={`w-full mb-4 relative rounded-lg  custom-editor ${
                  isFullScreen ? "full-screen" : ""
                }`}
                style={{ height: editorHeight }}
              >
                <MdEditor
                  style={{ height: "100%" }}
                  placeholder="Write contents with markdown.."
                  renderHTML={(text) => <ContentPreview content={text} />}
                  onChange={handleEditorChange}
                  value={content}
                  onImageUpload={handleImageUpload}
                  config={{
                    view: {
                      menu: true,
                      md: true,
                      html: false,
                    },
                    canView: {
                      menu: true,
                      md: true,
                      html: false,
                      fullScreen: false,
                      hideMenu: false,
                    },
                    markdownClass: "custom-markdown",
                    htmlClass: "custom-html",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => savePost(true)}
                  disabled={isLoading}
                  className="bg-teal-800 w-[80px] hover:bg-teal-900 text-white px-2 py-2 rounded-md"
                >
                  {isLoading ? "Publishing" : "Publish"}
                </button>
                <button
                  onClick={() => savePost(false)}
                  disabled={isLoading}
                  className=" text-white px-2 py-1 rounded-md hover:bg-teal-800 hover:opacity-60"
                >
                  {isLoading ? "Saving" : "Save"}
                </button>
              </div>
              {/* <button
              onClick={discardPost}
              className="bg-red-500 text-white px-2 hover:bg-red-600 py-1 rounded"
            >
              Discard
            </button> */}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ContentEditor;
