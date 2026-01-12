"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { SIDEBAR_NAVIGATION_ITEMS } from "@/features/social/config/sidebar-config";

interface MobileProfileCardProps {
  user?: {
    name: string;
    image?: string;
    headline?: string;
  };
}

export function MobileProfileCard({ user }: MobileProfileCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <Card className="mb-6 overflow-hidden md:hidden border-none shadow-sm bg-white dark:bg-card">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-background">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-base truncate">{user.name}</h3>
            {user.headline && (
              <p className="text-sm text-muted-foreground truncate">
                {user.headline}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group">
          <Bookmark className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          <Link
            href="/saved"
            className="font-medium text-sm flex-1 text-muted-foreground group-hover:text-foreground"
          >
            My items
          </Link>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-slate-50/50 dark:bg-muted/10">
          <div className="py-2">
            {SIDEBAR_NAVIGATION_ITEMS.map((group, i) => (
              <div key={i} className="mb-2 last:mb-0">
                {group.title && (
                  <h4 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h4>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    // Skip Saved items if we already showed it as My items
                    if (item.label === "Saved items") return null;

                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border">
        <Button
          variant="ghost"
          className="w-full rounded-none h-9 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <span className="flex items-center gap-1">
              Show less <ChevronUp className="h-3 w-3" />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Show more <ChevronDown className="h-3 w-3" />
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
}
