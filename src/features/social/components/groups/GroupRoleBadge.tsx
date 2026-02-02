"use client";

import { Badge } from "@/components/ui/badge";
import { type GroupRole } from "../../types";

interface GroupRoleBadgeProps {
  role: GroupRole;
  size?: "sm" | "default";
}

const roleConfig: Record<GroupRole, { label: string; variant: "default" | "secondary" | "outline" }> = {
  owner: { label: "Owner", variant: "default" },
  admin: { label: "Admin", variant: "secondary" },
  member: { label: "Member", variant: "outline" },
};

export function GroupRoleBadge({ role, size = "default" }: GroupRoleBadgeProps) {
  const config = roleConfig[role];
  
  return (
    <Badge
      variant={config.variant}
      className={size === "sm" ? "text-xs px-1.5 py-0" : undefined}
    >
      {config.label}
    </Badge>
  );
}
