'use client'

import { useEffect, FC, useState } from "react";
import { useParams } from "next/navigation";
import { PostData } from "@/src/libs/contentServices";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "@/src/libs/firebase";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import Image from "next/image";
import Link from "next/link";

const FullPostView: FC = () => {
    const { user } = useRequireAuth();
    const params = useParams();
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!params.id) return;

            try {
                const postDoc = await getDoc(doc(firestore, 'Posts', params.id as string));
                
                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() } as PostData);
                } else {
                    console.log('No such post!');
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id]);

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>Post not found</div>;

    return (
      <div className="full-post-container">
        <Link href="/feeds">
          <button className="back-btn">Back to feed</button>
        </Link>
        <h1>{post.title}</h1>
        <div className="post-tags">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
              <span className="tag">{tag}</span>
            </Link>
          ))}
        </div>
        <Image
          src={post.coverImage}
          alt="Cover image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="rounded-lg"
        />
        <div className="post-metadata">
          <span>Author: {post.authorId}</span>
          <span>
            Date: {new Date(post.createdAt as string).toLocaleDateString()}
          </span>
        </div>
        <div className="post-content">{post.content}</div>
      </div>
    );
};

export default FullPostView;