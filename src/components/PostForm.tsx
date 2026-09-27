"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { checkFile, kindOf, publicUrl, RECIPE_BUCKET } from "@/lib/media";
import { savePost, deletePost } from "@/actions/posts";
import type { Post } from "@/lib/types";

function uid() {
  return crypto.randomUUID();
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [coverPath, setCoverPath] = useState<string | null>(post?.cover_path ?? null);
  const [coverPreview, setCoverPreview] = useState<string | null>(publicUrl(post?.cover_path));
  const [uploading, setUploading] = useState(false);

  async function onCover(file: File | null) {
    if (!file) return;
    const bad = checkFile(file);
    if (bad || kindOf(file) !== "image") {
      setErrors({ coverPath: bad || "Cover must be an image." });
      return;
    }
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      setErrors({ form: "Please sign in again." });
      return;
    }
    setUploading(true);
    setErrors((e) => ({ ...e, coverPath: "" }));
    const path = `${userId}/${uid()}-${file.name.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 80)}`;
    const { error } = await supabase.storage.from(RECIPE_BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      setErrors({ coverPath: error.message });
      return;
    }
    setCoverPath(path);
    setCoverPreview(URL.createObjectURL(file));
  }

  function submit(intent: "draft" | "publish") {
    setErrors({});
    startTransition(async () => {
      const result = await savePost({ title, excerpt, body, coverPath, intent }, post?.id);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      router.push(result.status === "published" ? `/blog/${result.slug}` : "/admin/posts");
      router.refresh();
    });
  }

  function onDelete() {
    if (!post || !confirm("Delete this post permanently?")) return;
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    });
  }

  return (
    <form className="panel stack" onSubmit={(e) => { e.preventDefault(); submit("publish"); }} noValidate>
      <div className="f">
        <label htmlFor="post-title">Title</label>
        <input id="post-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
        {errors.title && <p className="f-err">{errors.title}</p>}
      </div>
      <div className="f">
        <label htmlFor="post-excerpt">Excerpt</label>
        <textarea id="post-excerpt" className="field" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} aria-invalid={!!errors.excerpt} />
        {errors.excerpt && <p className="f-err">{errors.excerpt}</p>}
      </div>
      <div className="f">
        <label htmlFor="post-body">Body</label>
        <textarea id="post-body" className="field post-body" rows={16} value={body} onChange={(e) => setBody(e.target.value)} aria-invalid={!!errors.body} />
        <p className="hint">Plain text — blank lines start new paragraphs.</p>
        {errors.body && <p className="f-err">{errors.body}</p>}
      </div>
      <div className="f">
        <label htmlFor="post-cover">Cover image</label>
        <input id="post-cover" type="file" accept="image/*" onChange={(e) => onCover(e.target.files?.[0] ?? null)} />
        {coverPreview && (
          <div className="post-cover-preview">
            <Image src={coverPreview} alt="" width={480} height={270} unoptimized />
            <button type="button" className="linkbtn" onClick={() => { setCoverPath(null); setCoverPreview(null); }}>Remove cover</button>
          </div>
        )}
        {errors.coverPath && <p className="f-err">{errors.coverPath}</p>}
      </div>
      {errors.form && <p className="f-err" role="alert">{errors.form}</p>}
      <div className="row-actions">
        <button type="submit" className="btn" disabled={pending || uploading}>{pending ? "Saving…" : "Publish"}</button>
        <button type="button" className="btn ghost" disabled={pending || uploading} onClick={() => submit("draft")}>Save draft</button>
        {post && <button type="button" className="btn danger" disabled={pending} onClick={onDelete}>Delete</button>}
      </div>
    </form>
  );
}
