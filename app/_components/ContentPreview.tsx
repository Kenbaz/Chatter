'use client';

import React, { FC } from "react";
import Markdown, {Components} from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { FieldValue } from "firebase/firestore";
import Link from "next/link";
import "prismjs/themes/prism-tomorrow.css";


interface ContentPreviewProps {
  title?: string;
  content: string;
  tags?: string[];
  coverImageUrl?: string;
  authorName?: string;
  authorId?: string;
  publishDate?: string | FieldValue;
  status?: "draft" | undefined | "published";
}


const ContentPreview: FC<ContentPreviewProps> = ({
  title,
  content,
  tags,
  coverImageUrl,
  authorName,
  authorId,
  publishDate,
  status
}) => {

  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl dark:text-white font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl dark:text-white font-bold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl dark:text-white font-bold my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg dark:text-white font-bold my-2" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-base dark:text-white font-bold my-1" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-sm dark:text-white font-bold my-1" {...props} />
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
        className="border-l-4 dark:border-lightGray border-gray-900 pl-4 py-2 my-2 "
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-4 whitespace-pre-wrap" {...props} />
    ),
    pre: ({ node, children, ...props }) => (
      <pre
        className="whitespace-pre-wrap break-words bg-black text-white p-4 rounded-md"
        {...props}
      >
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


  const getStatusDisplay = (): string => {
    switch (status) {
      case "draft":
        return "Publish draft when ready";
      case undefined:
        return "Not yet published";
      case "published":
        return "";
      default:
        return "Status unknown";
    }
  };


  return (
    <article className="max-w-4xl mt-14 dark:bg-primary bg-customWhite3 mx-auto md:w-11/12 md:m-auto md:mt-14 lg:landscape:w-[70%] lg:landscape:m-auto lg:landscape:mt-14">
      {coverImageUrl && (
        <div className="relative w-full aspect-[17/8] lg:landscape:aspect-[12/4] mb-5">
          <Image
            src={coverImageUrl}
            alt="Cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="md:rounded-md"
          />
        </div>
      )}
      <div className="p-2 md:pl-4 md:pr-4">
        {authorName && publishDate && (
          <div className="mb-4 text-sm flex gap-2 items-center">
            <div className="flex flex-col">
              <Link href={`/profile/${authorId}`}>
                <p className="dark:text-tinWhite font-semibold text-base tracking-wide">
                  {authorName}
                </p>
              </Link>
              <small className="text-gray-600 text-[14px]">
                {getStatusDisplay()}
              </small>
            </div>
          </div>
        )}
        {title && (
          <h1 className="text-3xl dark:text-white font-bold mb-4">{title}</h1>
        )}

        {tags && (
          <div className="mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block rounded-full dark:bg-customGray1 bg-customWhite2 mr-2 px-3 py-1 text-sm font-semibold dark:text-tinWhite text-gray-800 mb-2"
              >
                <span className="dark:text-gray-400 text-gray-500">#</span>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="prose max-w-none">
          <Markdown
            rehypePlugins={[
              rehypeRaw,
              [rehypeHighlight, { detectLanguage: true, alias: {} }],
            ]}
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
