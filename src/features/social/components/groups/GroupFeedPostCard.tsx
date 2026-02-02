"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { type GroupFeedPost } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface GroupFeedPostCardProps {
  post: GroupFeedPost;
  currentUserId?: string;
}

export function GroupFeedPostCard({ post, currentUserId }: GroupFeedPostCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.image || undefined} />
            <AvatarFallback>
              {post.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link
              href={`/feed/profile/${post.author.id}`}
              className="font-medium hover:underline truncate block"
            >
              {post.author.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden">
            {post.media.length === 1 ? (
              <img
                src={post.media[0].url}
                alt={post.media[0].altText || ""}
                className="w-full max-h-96 object-cover"
              />
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {post.media.slice(0, 4).map((media, idx) => (
                  <img
                    key={idx}
                    src={media.url}
                    alt={media.altText || ""}
                    className="w-full h-40 object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={post.isLiked ? "text-red-500" : "text-muted-foreground"}
          >
            <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
            {post.likeCount > 0 && post.likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.commentCount > 0 && post.commentCount}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
