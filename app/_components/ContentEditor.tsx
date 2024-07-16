'use client'

import React, { useState, useEffect, FC } from 'react';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../_store/store';
import Image from "next/image";
import { storage, firestore } from '@/src/libs/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { setLoading } from '../_store/loadingSlice';
import { setError } from '../_store/errorSlice';
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/char_counter.min.js";
import "froala-editor/js/plugins/markdown.min.js";
import "froala-editor/js/plugins/code_view.min.js";
import "froala-editor/js/plugins/video.min.js";

const FroalaEditor = dynamic(() => import("react-froala-wysiwyg"), {
  ssr: false,
});

const FroalaEditorView = dynamic(
  () => import("react-froala-wysiwyg/FroalaEditorView"),
  {
    ssr: false,
  }
);

interface ContentEditorProps {
    userId: string;
    postId?: string;
    coverImageUrl?: string;
}

const ContentEditor: FC<ContentEditorProps> = ({ userId, postId }) => {
    const dispatch = useDispatch();
    const isLoading = useSelector((state: RootState) => state.loading.isLoading);

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string>("");
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [content, setContent] = useState("");
    const [isPreview, setIsPreview] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
     }, [postId, dispatch]);

    const handleCoverImageUpload = async (file: File) => {
        const storageRef = ref(storage, `Cover_images/${file.name}`);
        const snapShot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapShot.ref);
        setCoverImageUrl(url);
    };

    const handleTagInput = (input: string) => {
        const newTags = input.split(',').map(tag => tag.trim());
        setTags(newTags);
    };

    const handleContentChange = (model: string) => {
        setContent(model);
    };

    const saveAsDraft = async () => {
        dispatch(setLoading(true));
        try {
            const postData = {
                title,
                tags,
                content,
                authorId: userId,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (postId) {
                await updateDoc(doc(firestore, 'Posts', postId), postData);
            } else {
                await addDoc(collection(firestore, 'Posts'), postData);
            }
            dispatch(setLoading(false));
            setSuccessMessage('Draft saved succesfully');
        } catch (error) {
            dispatch(setError('Failed to save draft'));
            dispatch(setLoading(false));
        };
    };

    const publishPost = async () => {
        dispatch(setLoading(true));
        try {
            const postData = {
                coverImage: coverImageUrl,
                title,
                tags,
                content,
                authorId: userId,
                status: 'published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (postId) {
                await updateDoc(doc(firestore, 'Posts', postId), postData);
            } else {
                await addDoc(collection(firestore, 'Posts'), postData);
            }
            dispatch(setLoading(false));
            setSuccessMessage('Successfully published')
        } catch (error) {
            dispatch(setError('Failed to publish post'));
            dispatch(setLoading(false));
        };
    };

    const togglePreview = () => {
        setIsPreview(!isPreview);
    };

    const handleImageUpload = (files: File[]): Promise<string[]> => {
        return Promise.all(
            files.map(async (file) => {
                const storageRef = ref(storage, `Post_images/${file.name}`);
                const snapShot = await uploadBytes(storageRef, file);
                return getDownloadURL(snapShot.ref);
            })
        );
    };

    const handleVideoUpload = (files: File[]): Promise<string[]> => {
      return Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `Post_videos/${file.name}`);
          const snapShot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapShot.ref);
        })
      );
    };

    const config = {
      placeholderText: "Type content in markdown",
      imageUplaod: true,
      imageUploadMethod: "POST",
      imageUploadParam: "file",
      imageUploadURL: "",
      videoUpload: true,
      videoUploadMethod: "POST",
      videoUploadParam: "file",
      videoUploadURL: "",

      markdown: true,
      events: {
        "image.beforeUpload": function (images: File[]) {
          handleImageUpload(images).then((urls) => {
            const editor = this as any;
            urls.forEach((url) => {
              editor.image.insert(url, null, null, editor.image.get());
            });
          });
          return false;
        },
        "video.beforeUpload": function (videos: File[]) {
          handleVideoUpload(videos).then((urls) => {
            const editor = this as any;
            urls.forEach((url) => {
              editor.video.insert(url);
            });
          });
          return false;
        },
      },
    };

    return (
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleCoverImageUpload(e.target.files[0])
          }
        />
        {coverImageUrl && (
          <div style={{ position: "relative", width: "100%", height: "300px" }}>
            <Image
              src={coverImageUrl}
              alt="Cover"
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}

        {successMessage}

        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          onChange={(e) => handleTagInput(e.target.value)}
        />

        {isPreview ? (
          <div className="fr-view">
            <h1>{title}</h1>
            <div>{tags.join(", ")}</div>
            <FroalaEditorView model={content} />
          </div>
        ) : (
          <FroalaEditor
            tag="textarea"
            config={config}
            model={content}
            onModelChange={handleContentChange}
          />
        )}

        <button onClick={togglePreview}>
          {isPreview ? "Edit" : "Preview"}
        </button>
        <button onClick={saveAsDraft} disabled={isLoading}>
          Save as Draft
        </button>
        <button onClick={publishPost} disabled={isLoading}>
          Publish
        </button>
      </div>
    );
}

export default ContentEditor