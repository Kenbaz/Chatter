'use client';

import React, { FC, useState, useEffect, useCallback } from "react";
import Markdown, {Components} from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { FieldValue } from "firebase/firestore";
import {
  Profile,
} from "@/src/libs/userServices";



interface ContentPreviewProps {
  title?: string;
  content: string;
  tags?: string[];
  coverImageUrl?: string;
  authorName?: string;
  authorId?: string;
  publishDate?: string | FieldValue;
}

const ContentPreview: FC<ContentPreviewProps> = ({
  title,
  content,
  tags,
  coverImageUrl,
  authorName,
  authorId,
  publishDate,
}) => {
  const [authorProfilePicture, setAuthorProfilePicture] = useState("");
   const [isLoading, setIsLoading] = useState(false);

  const { getUserProfile } = Profile();

  const fetchAuthorData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (typeof authorId !== 'undefined') {
        const userData = await getUserProfile(authorId);
        if (userData) {
          setAuthorProfilePicture(
            userData.profilePictureUrl || "/images/default-profile-image-2.jpg"
          );
        } else {
          setAuthorProfilePicture("/images/default-profile-image-2.jpg");
        }
      }   
    } catch (error) {
      console.error('Error fetching user data:', error)
      setAuthorProfilePicture('');
    } finally {
      setIsLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchAuthorData()
  }, [fetchAuthorData]);

  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl text-white font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl text-white font-bold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl text-white font-bold my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg text-white font-bold my-2" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-base text-white font-bold my-1" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-sm text-white font-bold my-1" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside my-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside my-4" {...props} />
    ),
    u: ({ node, ...props }) => <u className="underline" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 py-2 my-2 "
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-4 whitespace-pre-wrap" {...props} />
    ),
    pre: ({ node, children, ...props }) => (
      <pre className="whitespace-pre-wrap break-words" {...props}>
        {children}
      </pre>
    ),
    a: ({ node, ...props }) => (
      <a className="text-blue-600 hover:underline" {...props} />
    ),
    img: ({ node, ...props }) => (
      <Image
        src={props.src || ""}
        alt={props.alt || ""}
        width={400}
        height={200}
        style={{ objectFit: "contain" }}
      />
    ),
  };

  const formattedDate =
    publishDate instanceof FieldValue
      ? new Date().toLocaleDateString()
      : publishDate;
  

  return (
    <article className="max-w-4xl bg-primary mx-auto">
      {coverImageUrl && (
        <div className="relative w-full h-52 mb-10">
          <Image
            src={coverImageUrl}
            alt="Cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="rounded-lg"
          />
        </div>
      )}
      <div className="p-2">
        {authorName && publishDate && (
          <div className="mb-4 text-sm flex gap-2 items-center">
            {isLoading ? (
              <div className="w-[40px] h-[40px] rounded-[50%] overflow-hidden flex justify-center items-center">
                <Image
                  src={"/images/default-profile-image-2.jpg"}
                  alt="avatar"
                  width={40}
                  height={40}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : authorProfilePicture ? (
              <div className="w-[40px] h-[40px] rounded-[50%] overflow-hidden flex justify-center items-center">
                <Image
                  src={authorProfilePicture}
                  alt="avatar"
                  width={40}
                  height={40}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : null}
            <div className="flex flex-col">
              <p className="text-tinWhite font-semibold text-base tracking-wide">
                {authorName}
              </p>
              <small className="text-gray-600 text-[14px]">
                Published on {formattedDate}
              </small>
            </div>
          </div>
        )}
        {title && (
          <h1 className="text-3xl text-white font-bold mb-4">{title}</h1>
        )}
        {/* {authorName && publishDate && (
        <div className="mb-4 text-sm text-gray-600">
          By {authorName} | Published on {formattedDate}
        </div>
      )} */}

        {tags && (
          <div className="mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
              >
                <span className="text-teal-700">#</span>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="prose max-w-none">
          <Markdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </Markdown>
        </div>
      </div>
    </article>
  );
};

export default ContentPreview;
