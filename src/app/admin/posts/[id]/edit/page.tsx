import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/queries";
import { PostForm } from "@/components/PostForm";

export const metadata: Metadata = { title: "Admin · Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]/edit">) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <>
      <div className="sec-head">
        <div>
          <h2>Edit post</h2>
          <p>{post.title}</p>
        </div>
      </div>
      <PostForm post={post} />
    </>
  );
}
