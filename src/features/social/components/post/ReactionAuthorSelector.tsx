// Reaction Author Selector Component
// Dropdown to select who you are reacting/commenting as
"use client";

import { useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { useFeedStore } from "../../stores/feed-store";
import { useCollegeMemberships } from "../../hooks/use-memberships";
import type { AuthorType } from "../../types";

interface ReactionAuthorSelectorProps {
  className?: string;
}

export function ReactionAuthorSelector({
  className,
}: ReactionAuthorSelectorProps) {
  const { data: session } = useSession();
  const { data: collegeMemberships = [] } = useCollegeMemberships();
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);
  const setReactionAuthor = useFeedStore((s) => s.setReactionAuthor);

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "User",
        image: session.user.image ?? undefined,
      }
    : null;

  // Initialize reaction author if not set
  useEffect(() => {
    if (currentUser && !reactionAuthor) {
      setReactionAuthor({
        id: currentUser.id,
        type: "user",
        name: currentUser.name,
        image: currentUser.image,
      });
    }
  }, [currentUser, reactionAuthor, setReactionAuthor]);

  // Auto-correct selection if membership is lost
  useEffect(() => {
    if (reactionAuthor?.type === "college" && currentUser) {
      const isStillMember = collegeMemberships.some(
        (m) =>
          m.college.college_id.toString() === reactionAuthor.id &&
          m.role === "college_admin",
      );

      if (!isStillMember) {
        setReactionAuthor({
          id: currentUser.id,
          type: "user",
          name: currentUser.name,
          image: currentUser.image,
        });
      }
    }
  }, [collegeMemberships, reactionAuthor, currentUser, setReactionAuthor]);

  if (!currentUser || !reactionAuthor) return null;

  // If user has no college memberships, we don't need a dropdown
  if (collegeMemberships.length === 0) {
    return null;
  }

  const initials = reactionAuthor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 1);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-1 outline-none ${className}`}
      >
        <Avatar className="h-6 w-6 border border-border/50">
          <AvatarImage src={reactionAuthor.image} />
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <ChevronDown className="h-3 w-3 text-muted-foreground opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuItem
          onClick={() =>
            setReactionAuthor({
              id: currentUser.id,
              type: "user",
              name: currentUser.name,
              image: currentUser.image,
            })
          }
          className="flex items-center gap-2 cursor-pointer"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser.image} />
            <AvatarFallback>
              {currentUser.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate">{currentUser.name}</span>
          {reactionAuthor.type === "user" && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        {collegeMemberships.length > 0 && (
          <>
            {collegeMemberships.map((m) => (
              <DropdownMenuItem
                key={m.college.college_id}
                onClick={() =>
                  setReactionAuthor({
                    id: m.college.college_id.toString(),
                    type: "college",
                    name: m.college.college_name,
                    image: m.college.logo_img,
                  })
                }
                className="flex items-center gap-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={m.college.logo_img} />
                  <AvatarFallback>
                    {m.college.college_name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">
                  {m.college.college_name}
                </span>
                {reactionAuthor.type === "college" &&
                  reactionAuthor.id === m.college.college_id.toString() && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
