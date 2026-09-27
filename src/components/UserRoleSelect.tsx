"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/actions/users";
import { ROLES, type Profile, type Role } from "@/lib/types";

export function UserRoleSelect({ profile, disabled }: { profile: Profile; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(role: Role) {
    if (role === profile.role) return;
    startTransition(async () => {
      const result = await updateUserRole({ userId: profile.id, role });
      if (!result.ok) alert(result.errors.form || "Couldn't update role.");
      else router.refresh();
    });
  }

  return (
    <select
      className="field small"
      value={profile.role}
      disabled={disabled || pending}
      aria-label={`Role for ${profile.display_name || profile.username || "user"}`}
      onChange={(e) => onChange(e.target.value as Role)}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
