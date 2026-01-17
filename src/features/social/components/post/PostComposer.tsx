// Post Composer Component
// Modal/form for creating new posts with media upload

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Image as ImageIcon,
  X,
  Globe,
  Users,
  Lock,
  Loader2,
  Smile,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePost, useUpdatePost } from "../../hooks/use-post";
import type { PostVisibility, Author, Post } from "../../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: Author;
  postToEdit?: Post | null;
}

interface PostFormData {
  content: string;
  visibility: PostVisibility;
}

const visibilityOptions = [
  { value: "public", label: "Anyone", icon: Globe },
  { value: "followers", label: "Followers only", icon: Users },
  { value: "private", label: "Only me", icon: Lock },
] as const;

export function PostComposer({
  isOpen,
  onClose,
  currentUser,
  postToEdit,
}: PostComposerProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!postToEdit;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      content: postToEdit?.content || "",
      visibility: postToEdit?.visibility || "public",
    },
  });

  // Reset/Prefill form when opening
  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setValue("content", postToEdit.content);
        setValue("visibility", postToEdit.visibility);
        // Note: Handling existing media files requires more complex logic to differentiate
        // between existing URLs and new Files. For now, ignoring existing media edit.
      } else {
        reset({ content: "", visibility: "public" });
        setMediaFiles([]);
        setMediaPreviews([]);
      }
    }
  }, [isOpen, postToEdit, setValue, reset]);

  const content = watch("content");
  const visibility = watch("visibility");
  const charCount = content?.length || 0;
  const maxChars = 3000;

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 4) {
      toast.error("You can only upload up to 4 images");
      return;
    }

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    reset();
    setMediaFiles([]);
    mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    setMediaPreviews([]);
    onClose();
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      if (isEditing && postToEdit) {
        await updatePost.mutateAsync({
          postId: postToEdit.id,
          data: {
            content: data.content,
            visibility: data.visibility,
          },
        });
      } else {
        // NOTE: Media upload is not yet implemented on the backend for CreatePostDto
        await createPost.mutateAsync({
          content: data.content,
          visibility: data.visibility,
        });
      }
      handleClose();
    } catch {
      // Toast handled by hooks
    }
  };

  const userInitials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const isPending = createPost.isPending || updatePost.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 bg-background dark:bg-zinc-900 border-border/50 gap-0">
        <div className="p-6 pb-2 relative flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit post" : "Create post"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Header: User Info & Visibility */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border/50">
                <AvatarImage src={currentUser?.image ?? undefined} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg leading-none mb-1 text-foreground">
                  {currentUser?.name || "You"}
                </span>
                <Select
                  value={visibility}
                  onValueChange={(val) =>
                    setValue("visibility", val as PostVisibility)
                  }
                >
                  <SelectTrigger className="h-auto w-fit p-0 border-0 bg-transparent text-muted-foreground/80 hover:text-foreground text-sm font-medium focus:ring-0 gap-1 shadow-none transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {visibilityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Input */}
            <div className="py-2">
              <Textarea
                {...register("content", {
                  required: "Write something to post",
                  maxLength: {
                    value: maxChars,
                    message: `Max ${maxChars} characters`,
                  },
                })}
                placeholder="What do you want to talk about?"
                className="min-h-[160px] border-0 resize-none text-xl bg-transparent focus-visible:ring-0 p-0 placeholder:text-muted-foreground/40 leading-relaxed font-normal"
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Media Previews (Read Only for existing posts for now) */}
            {postToEdit?.media && postToEdit.media.length > 0 && isEditing && (
              <div className="grid gap-2 mb-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Existing media (cannot edit yet)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {postToEdit.media.map((media, i) => (
                    <div
                      key={i}
                      className="aspect-video bg-muted rounded overflow-hidden"
                    >
                      <img
                        src={media.url}
                        alt="Existing"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Media Previews */}
            {mediaPreviews.length > 0 && (
              <div
                className={cn(
                  "grid gap-2 mb-4",
                  mediaPreviews.length === 1 && "grid-cols-1",
                  mediaPreviews.length === 2 && "grid-cols-2",
                  mediaPreviews.length >= 3 && "grid-cols-2"
                )}
              >
                {mediaPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative rounded-lg overflow-hidden bg-muted",
                      mediaPreviews.length === 1 && "aspect-video",
                      mediaPreviews.length >= 2 && "aspect-square"
                    )}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Footer Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/5 dark:bg-muted/10 gap-4 shrink-0">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0 no-scroll-bar">
            {!isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaSelect}
                />

                <ToolbarButton
                  icon={Smile}
                  tooltip="Add emoji"
                  onClick={() => toast("Emoji picker coming soon")}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 gap-2 rounded-lg text-foreground hover:bg-muted/60 px-3 mx-1 font-semibold shrink-0 transition-colors"
                  onClick={() => toast("AI Rewrite coming soon")}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Rewrite with AI</span>
                </Button>

                <ToolbarButton
                  icon={ImageIcon}
                  tooltip="Add photos"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={mediaFiles.length >= 4}
                />
                {/* More buttons... */}
                <ToolbarButton icon={MoreHorizontal} tooltip="More options" />
              </>
            )}
            {isEditing && (
              <p className="text-sm text-muted-foreground italic">
                Editing mode (media changes disabled)
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 shrink-0 border-l border-border/50 relative">
            {charCount > maxChars && (
              <span className="absolute -top-6 right-0 text-xs text-destructive font-medium bg-background px-1 rounded shadow-sm border">
                {charCount}/{maxChars}
              </span>
            )}
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!content?.trim() || charCount > maxChars || isPending}
              className="rounded-full px-8 py-5 font-bold text-base bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save" : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  tooltip: string;
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  className,
  ...props
}: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full shrink-0",
              className
            )}
            {...props}
          >
            <Icon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
