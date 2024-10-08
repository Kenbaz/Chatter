import FullPostView from "@/app/_components/FullPostView";
import { Metadata } from "next";
import { postFuncs } from "@/src/libs/contentServices";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { getPostById } = postFuncs();
  const post = await getPostById(params.id);

  if (!post) {
    return {
      title: "Post Not Found",
    };
    }
    
    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.id}`;
    const ogImageUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL
    }/api/og?title=${encodeURIComponent(
      post.title
    )}&author=${encodeURIComponent(post.author)}&image=${encodeURIComponent(
      post.coverImage
    )}`;

  const description = `Read more about ${post.title}`;

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      siteName: "Chatter",
      authors: [`Written by ${post.author}`],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 600,
          alt: post.title,
        },
      ],
      url: postUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: [post.coverImage],
      creator: "@Ken_baz",
    },
  };
}

async function PostPage({ params }: Props) {
    const { getPostById } = postFuncs();
    const post = await getPostById(params.id);

   if (!post) {
     return <div>Post not found</div>;
   }

   return <FullPostView postId={params.id} />;
};

export default PostPage;