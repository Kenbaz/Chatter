'use client';

import React, { FC } from "react";
import Markdown, {Components} from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { FieldValue } from "firebase/firestore";
import Link from "next/link";



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
        <div className="relative w-full aspect-[16/8] mb-10">
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
      <div className="p-2">
        {authorName && publishDate && (
          <div className="mb-4 text-sm flex gap-2 items-center">
            
            <div className="flex flex-col">
              <Link href={`/profile/${authorId}`}>
                <p className="text-tinWhite font-semibold text-base tracking-wide">
                  {authorName}
                </p>
              </Link>
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
                className="inline-block rounded-full bg-gray-200 mr-2 px-3 py-1 text-sm font-semibold text-gray-800 mb-2"
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
