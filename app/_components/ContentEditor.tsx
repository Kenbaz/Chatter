"use client";

import React, { useState, useEffect, FC } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import Image from "next/image";
import { storage, firestore } from "@/src/libs/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { setLoading } from "../_store/loadingSlice";
import { useAuth } from "@/src/libs/authServices";
import { auth } from "@/src/libs/firebase";
import { setError } from "../_store/errorSlice";
import ContentPreview from "./ContentPreview";
import "react-markdown-editor-lite/lib/index.css";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

interface ContentEditorProps {
  userId: string;
  postId?: string;
}

interface PostData {
  title: string;
  tags: string[];
  content: string;
  authorId: string;
  status: string;
  coverImage: string;
  updatedAt: string;
  createdAt?: string;
}

const ContentEditor: FC<ContentEditorProps> = ({ userId, postId }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  const { signOutUser } = useAuth();

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishDate, setPublishDate] = useState("");

  useEffect(() => {
    const fetchPostData = async (id: string) => {
      try {
        const docRef = doc(firestore, "Posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const postData = docSnap.data();
          setTitle(postData.title);
          setContent(postData.content);
          setTags(postData.tags);
          setCoverImageUrl(postData.coverImage);
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
        setAuthorName(userDoc.data().name || "Anonymous");
      }
    };
    fetchAuthorName();
    setPublishDate(new Date().toLocaleDateString());
  }, [postId, dispatch, userId]);

  const handleCoverImageUpload = async (file: File) => {
    try {
      setCoverImageFile(file);
    const storageRef = ref(storage, `Cover_images/${file.name}`);
    const snapShot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapShot.ref);
    setCoverImageUrl(url);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      dispatch(setError('Please select file'))
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
    input.click()
  };

  const handleTagInput = (input: string) => {
    const newTags = input.split(",").map((tag) => tag.trim());
    setTags(newTags);
  };

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text);
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
      tags,
      content,
      authorId: userId,
      status: publish ? "published" : "draft",
      coverImage: coverImageUrl,
      updatedAt: new Date().toISOString(),
    };

    try {
      const postRef = postId
        ? doc(firestore, "Posts", postId)
        : doc(collection(firestore, "Posts"));

      if (!postId) {
        postData.createdAt = new Date().toISOString();
      }

      await setDoc(postRef, postData, { merge: true });
      setSuccessMessage(
        `${publish ? "Post published successfully" : "Draft saved"}`
      );
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError("Error saving post"));
      console.error("Error saving post:", error);
      dispatch(setLoading(false));
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isPreview ? (
        <div className="fixed inset-0 z-50 overflow-auto">
          <ContentPreview
            title={title}
            content={content}
            tags={tags}
            coverImageUrl={coverImageUrl}
            authorName={authorName}
            publishDate={publishDate}
          />
          <button
            onClick={togglePreview}
            className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
        </div>
      ) : (
        <>
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <button
            onClick={handleSetCoverImage}
            className="border p-2 rounded-full mr-4 mb-4"
          >
            Set cover image
          </button>

          {coverImageUrl && (
            <div className="relative w-[20%] h-32 mb-4">
              <Image
                src={coverImageUrl}
                alt="Cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
              <button
                onClick={() => setCoverImageUrl("")}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
              >
                Remove
              </button>
            </div>
          )}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-primary text-4xl font-bold text-tinWhite p-2 mb-4 border-none outline-none rounded focus:ring-0 placeholder-gray-300"
            />
          </div>

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            onChange={(e) => handleTagInput(e.target.value)}
            className="w-full p-2 mb-4 border rounded bg-primary outline-none border-none"
          />

          <button
            className="cursor-pointer mb-4 bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => signOutUser()}
          >
            Sign out
          </button>

          <div className="w-full mb-4 border rounded custom-editor">
            <MdEditor
              style={{ height: "300px" }}
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
                  fullScreen: true,
                  hideMenu: true,
                },
                markdownClass: "custom-markdown",
                htmlClass: "custom-html",
              }}
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={togglePreview}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Preview
            </button>
            <button
              onClick={() => savePost(false)}
              disabled={isLoading}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Save as Draft
            </button>
            <button
              onClick={() => savePost(true)}
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Publish
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentEditor;
