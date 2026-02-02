"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { useCreateGroupPost } from "../../hooks/use-group-detail";
import { toast } from "sonner";

interface GroupPostComposerProps {
  slugId: string;
  currentUser: {
    id: string;
    name: string;
    image?: string;
  };
}

export function GroupPostComposer({ slugId, currentUser }: GroupPostComposerProps) {
  const [content, setContent] = useState("");
  const createPost = useCreateGroupPost(slugId);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({ content: content.trim() });
      setContent("");
      toast.success("Post created!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.image} />
            <AvatarFallback>
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share something with the group..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 text-sm"
            />
            <div className="flex items-center justify-between pt-3 border-t mt-3">
              <Button variant="ghost" size="sm" disabled>
                <ImagePlus className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || createPost.isPending}
              >
                {createPost.isPending && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
