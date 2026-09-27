import type { Metadata } from "next";
import { PostForm } from "@/components/PostForm";

export const metadata: Metadata = { title: "Admin · New post" };

export default function NewPostPage() {
  return (
    <>
      <div className="sec-head">
        <div>
          <h2>New blog post</h2>
          <p>Draft privately or publish straight to the blog.</p>
        </div>
      </div>
      <PostForm />
    </>
  );
}
