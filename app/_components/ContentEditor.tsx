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
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import "react-markdown-editor-lite/lib/index.css";
import { tagFuncs } from "@/src/libs/contentServices";
import { Comment } from "@/src/libs/contentServices";
import { algoliaPostsIndex } from "@/src/libs/algoliaClient";
import { useRouter } from "next/navigation";
import { Search, XIcon } from "lucide-react";


const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

interface ContentEditorProps {
  userId: string;
  postId?: string;
  postStatus?: "draft" | "published";
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

const ContentEditor: FC<ContentEditorProps> = ({ userId, postId, postStatus }) => {
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
   const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isDraft, setIsDraft] = useState(postStatus === "draft");
   const [tagColors, setTagColors] = useState<Record<string, string>>({});

  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { user } = useRequireAuth();

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

   const filteredTags = availableTags.filter((tag) =>
     tag.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

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

  const handleTagRemove = (tagId: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.filter((id) => id !== tagId);
      setLocalContent((prevContent) => ({ ...prevContent, tags: newTags }));
      return newTags;
    });
  };


  const toggleTagDropdown = () => {
    setIsTagDropdownOpen(!isTagDropdownOpen);
    if (!isTagDropdownOpen) {
      setSearchTerm("");
    }
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

          // Convert tag names to IDs
        const tagIds = postData.tags
          .map((tagName: string) => {
            const tag = availableTags.find((t) => t.name === tagName);
            return tag ? tag.id : null;
          })
          .filter((tagId: string): tagId is string => tagId !== null);
          
          setTitle(postData.title);
          setContent(postData.content);
          setSelectedTags(tagIds);
          console.log('selected Tags:', postData.tags);
          setCoverImageUrl(postData.coverImage);
           setIsDraft(postData.status === "draft");
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
  }, [postId, userId]);

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

  useEffect(() => {
    if (error) {
      setIsErrorVisible(true);
      const timer = setTimeout(() => {
        setIsErrorVisible(false);
        setTimeout(() => {
          dispatch(clearError());
        }, 300); // Wait for fade out animation to complete before clearing the error
      }, 5000); // Error message will start to disappear after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      dispatch(setError("Please enter a title for your post"));
      return false;
    }
    if (!content.trim()) {
      dispatch(setError("Please enter some content for your post"));
      return false;
    }
    if (selectedTags.length === 0) {
      dispatch(setError("Please select atleast one tag for your post"));
      return false;
    }
    return true;
  };

  const savePost = async (publish: boolean = false) => {
    if (!auth.currentUser) {
      dispatch(setError("Sign in to save a post"));
      return;
    }

     if (publish) {
    setIsPublishing(true);
  } else if (isDraft || !postId) {
    setIsSavingDraft(true);
  } else {
    setIsSavingChanges(true);
    }
    

    dispatch(setLoading(true));
    if (!validateForm()) {
      dispatch(setLoading(false));
      setIsPublishing(false);
      setIsSavingDraft(false);
      setIsSavingChanges(false);
      return;
    }

    try {
      let postData: PostData = {
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

      const postRef = postId
        ? doc(firestore, "Posts", postId)
        : doc(collection(firestore, "Posts"));

      if (postId) {
        // Fetch the existing post data
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
          const existingPostData = postSnapshot.data() as PostData;
          // Merge the new changes with the existing data
          postData = {
            ...existingPostData,
            ...postData,
            likes: existingPostData.likes || [],
            comments: existingPostData.comments || [],
          };
        }
      } else {
        postData.createdAt = Timestamp.now();
      }

      await setDoc(postRef, postData, { merge: true });

      // Clear local storage after a successful save
      clearLocalStorage();

      setSuccessMessage(
        `${publish ? "Post published successfully" : "Draft saved"}`
      );
      dispatch(setLoading(false));
      dispatch(clearError());

      if (publish) {
        // sync with algolia
        if (!postId || isDraft) {
          const algoliaObject = {
            objectID: postRef.id,
            title: postData.title,
            authorId: postData.authorId,
            author: postData.author,
            updatedAt: new Date().toISOString(),
            createdAt: postData.createdAt
              ? new Date().toISOString()
              : undefined,
          };
          await algoliaPostsIndex.saveObject(algoliaObject);
        }
        router.push(`/post/${postRef.id}`);
      } else {
        router.push(`/profile/${userId}`);
      }
    } catch (error) {
      dispatch(setError("Error saving post"));
      console.error("Error saving post:", error);
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
      setIsSavingChanges(false);
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
      <header className="h-14 flex items-center justify-end bg-headerColor fixed w-full top-0 z-50 lg:landscape:h-10 xl:w-[70%] xl:ml-[12rem]">
        <button
          onClick={togglePreview}
          className="text-tinWhite z-50 text-[15px] px-2 mr-4 py-2 rounded-lg preview-btn hover:bg-teal-700 hover:opacity-95 lg:landscape:relative lg:landscape:right-36 lg:relative lg:right-28 xl:-left-28"
        >
          Preview
        </button>
      </header>
      {}
      <div className="max-w-4xl mt-14 pb-[5rem] relative mx-auto p-4 md:w-[90%] md:m-auto md:mt-14 md:pb-[6rem] lg:landscape:w-[70%] lg:landscape:m-auto lg:landscape:mt-10 lg:landscape:p-2 lg:landscape:pb-7">
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
              className="absolute top-2 right-28 text-[15px] rouned-lg w-20 hover:bg-teal-700 hover:opacity-95 text-white px-4 py-[7px] rounded md:top-2 md:right-28 lg:landscape:right-60 lg:landscape:top-0 lg:right-56 xl:left-[63%] xl:mt-[1px]"
            >
              Edit
            </button>
          </div>
        ) : (
          <>
            <div
              ref={contentRef}
              className="mr-4 mb-4 overflow-y-auto w-full content-ref h-[720px] md:h-[84vh] lg:landscape:h-[81vh]"
            >
              {successMessage && (
                <div className=" px-4 py-3 rounded relative mb-2" role="alert">
                  <span className="block sm:inline text-green-700">
                    {successMessage}
                  </span>
                </div>
              )}
              <div
                className={`
            bg-red-900 text-red-500 px-4 py-3 rounded relative mb-4
            transition-all duration-300 ease-in-out
            ${
              isErrorVisible
                ? "opacity-100 max-h-20"
                : "opacity-0 max-h-0 overflow-hidden"
            }
          `}
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
              <button
                onClick={handleSetCoverImage}
                className="border border-primary text-tinWhite hover:border-primary px-4 p-2 rounded-lg mr-4 mb-4 lg:landscape:mb-6"
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
              <div className=" w-full p-2 pb-4 lg:landscape:-mb-3">
                <textarea
                  placeholder="Title..."
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-headerColor text-2xl border-none -mb-7 font-bold text-tinWhite outline-none focus:ring-0 placeholder-gray-300 resize-none h-full overflow-hidden md:text-3xl"
                />
              </div>
              <div className="mb-6 relative">
                <div
                  onClick={toggleTagDropdown}
                  className="w-full p-2 mb-4 rounded bg-headerColor outline-none cursor-pointer text-tinWhite"
                >
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tagId) => {
                        const tag = availableTags.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tag.id}
                            className="bg-gray-800 rounded-full px-2 py-1 text-sm flex items-center tracking-wide"
                          >
                            <span style={{ color: tagColors[tag.id] }}>#</span>
                            {tag.name}
                            <XIcon
                              className="ml-1 cursor-pointer hover:text-teal-300"
                              size={16}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent dropdown from toggling
                                handleTagRemove(tag.id);
                              }}
                            />
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    "Select Tags (max 3)"
                  )}
                </div>
                {isTagDropdownOpen && (
                  <div className="tag-dropdown w-full mt-1 max-h-[250px] overflow-y-auto border-none rounded shadow-lg bg-headerColor">
                    <div className="sticky top-0 bg-headerColor z-10 p-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search tags..."
                          className="w-full p-2 rounded bg-headerColor border border-customGray1 outline-none text-white"
                        />
                        <Search
                          className="absolute right-2 top-2 text-gray-400"
                          size={20}
                        />
                      </div>
                    </div>
                    <div className="p-2">
                      {filteredTags.map((tag) => (
                        <div
                          key={tag.id}
                          onClick={() => handleTagSelect(tag)}
                          className={`p-2 mb-2 rounded-md hover:bg-gray-800 cursor-pointer ${
                            selectedTags.includes(tag.id) ? "bg-gray-800" : ""
                          } text-tinWhite`}
                        >
                          <span style={{ color: tagColors[tag.id] }}>#</span>
                          {tag.name}
                        </div>
                      ))}
                      {filteredTags.length === 0 && (
                        <div className="p-2 text-gray-400">No tags found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                ref={editorRef}
                className={`w-full mb-4 relative rounded-lg md:h-[]  custom-editor ${
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
              {postId ? (
                // Editing an existing post
                <div className="flex gap-4">
                  {isDraft ? (
                    <>
                      <button
                        onClick={() => savePost(true)}
                        disabled={isPublishing || isSavingDraft}
                        className="bg-teal-800 hover:bg-teal-900 text-white px-2 py-2 rounded-md"
                      >
                        {isPublishing ? "Publishing" : "Publish"}
                      </button>
                      <button
                        onClick={() => savePost(false)}
                        disabled={isPublishing || isSavingDraft}
                        className="text-white px-2 py-1 rounded-md hover:bg-teal-800 hover:opacity-60"
                      >
                        {isSavingDraft ? "Saving" : "Save Draft"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => savePost(true)}
                      disabled={isSavingChanges}
                      className="text-white px-2 py-1 rounded-md bg-teal-800"
                    >
                      {isSavingChanges ? "Saving" : "Save Changes"}
                    </button>
                  )}
                </div>
              ) : (
                // Creating a new post
                <div className="flex gap-4">
                  <button
                    onClick={() => savePost(true)}
                    disabled={isPublishing || isSavingDraft}
                    className="bg-teal-800 w-[100%] hover:bg-teal-900 text-white px-2 py-2 rounded-md"
                  >
                    {isPublishing ? "Publishing" : "Publish"}
                  </button>
                  <button
                    onClick={() => savePost(false)}
                    disabled={isPublishing || isSavingDraft}
                    className=" text-white px-2 py-1 rounded-md hover:bg-teal-800 hover:opacity-60"
                  >
                    {isSavingDraft ? "Saving" : "Save"}
                  </button>
                </div>
              )}
              <button
                onClick={discardPost}
                className="bg-red-500 text-white px-2 hover:bg-red-600 py-1 rounded"
              >
                Discard
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ContentEditor;
