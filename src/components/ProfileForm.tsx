"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET, IMAGE_TYPES, isLocalUrl, publicUrl } from "@/lib/media";
import { updateProfile } from "@/actions/profile";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarPath, setAvatarPath] = useState(profile.avatar_path);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const avatar = publicUrl(avatarPath, AVATAR_BUCKET);

  async function onAvatar(file: File) {
    if (!IMAGE_TYPES.includes(file.type) || file.size > 5 * 1024 * 1024) { setErrors({ avatarPath: "Use a JPG, PNG, or WebP under 5 MB." }); return; }
    setUploading(true);
    const path = `${profile.id}/avatar-${Date.now()}.${file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) setErrors({ avatarPath: "Upload failed. Try again." });
    else { setAvatarPath(path); setErrors({}); }
  }

  return (
    <form
      className="panel stack"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        start(async () => {
          const res = await updateProfile({ displayName, username, bio, avatarPath });
          if (res.ok) { setErrors({}); setSaved(true); router.refresh(); }
          else setErrors(res.errors);
        });
      }}
    >
      <div className="avatar-row">
        <div className="avatar-lg">
          {avatar ? <Image src={avatar} alt="" fill sizes="96px" unoptimized={isLocalUrl(avatar)} /> : <span aria-hidden="true">{(displayName || "?").slice(0, 1).toUpperCase()}</span>}
        </div>
        <label className="btn ghost small">
          {uploading ? "Uploading…" : "Change photo"}
          <input type="file" className="sr" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onAvatar(f); }} />
        </label>
      </div>
      {errors.avatarPath && <p className="f-err">{errors.avatarPath}</p>}
      <div className="f">
        <label htmlFor="dn">Display name</label>
        <input id="dn" className="field" value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} aria-invalid={!!errors.displayName} />
        {errors.displayName && <p className="f-err">{errors.displayName}</p>}
      </div>
      <div className="f">
        <label htmlFor="un">Username <small>(optional, for your public page later)</small></label>
        <input id="un" className="field" value={username} maxLength={24} placeholder="bananafan_42" onChange={(e) => setUsername(e.target.value.toLowerCase())} aria-invalid={!!errors.username} />
        {errors.username && <p className="f-err">{errors.username}</p>}
      </div>
      <div className="f">
        <label htmlFor="bio">Bio <small>{bio.length}/280</small></label>
        <textarea id="bio" className="field" rows={3} maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      {errors.form && <p className="f-err" role="alert">{errors.form}</p>}
      {saved && <p className="ok-msg" role="status">Profile saved.</p>}
      <div className="row-actions"><button className="btn" type="submit" disabled={pending || uploading}>{pending ? "Saving…" : "Save profile"}</button></div>
    </form>
  );
}
