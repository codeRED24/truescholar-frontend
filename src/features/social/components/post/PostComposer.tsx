// Post Composer Component
// Modal/form for creating new posts with media upload

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MentionTextarea } from "@/components/ui/mention-textarea";
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
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { SimpleDropdown } from "@/components/ui/simple-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreatePost, useUpdatePost } from "../../hooks/use-post";
import { uploadPostMedia, searchHandles } from "../../api/social-api";
import {
  isApiError,
  type PostVisibility,
  Author,
  Post,
  PostMedia,
} from "../../types";
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

// Track uploaded media with upload status
interface UploadedMedia {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  type?: "image" | "video" | "document";
  isUploading: boolean;
  error?: string;
}

const visibilityOptions = [
  { value: "public" as const, label: "Anyone", icon: Globe },
  { value: "followers" as const, label: "Followers only", icon: Users },
  { value: "private" as const, label: "Only me", icon: Lock },
];

export function PostComposer({
  isOpen,
  onClose,
  currentUser,
  postToEdit,
}: PostComposerProps) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!postToEdit;

  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!searchValue) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const response = await searchHandles(searchValue);
      if (!isApiError(response)) {
        setSuggestions(response.data);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

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
      } else {
        reset({ content: "", visibility: "public" });
        setUploadedMedia([]);
      }
    }
  }, [isOpen, postToEdit, setValue, reset]);

  const content = watch("content");
  const visibility = watch("visibility");
  const charCount = content?.length || 0;
  const maxChars = 3000;

  // Check if any media is still uploading
  const isMediaUploading = uploadedMedia.some((m) => m.isUploading);

  // Upload a single file
  const uploadFile = async (file: File, index: number) => {
    const result = await uploadPostMedia(file);

    setUploadedMedia((prev) =>
      prev.map((m, i) => {
        if (i === index) {
          if (isApiError(result)) {
            return { ...m, isUploading: false, error: result.error };
          }
          return {
            ...m,
            isUploading: false,
            uploadedUrl: result.data.url,
            type: result.data.type,
          };
        }
        return m;
      }),
    );

    if (isApiError(result)) {
      toast.error(`Failed to upload: ${result.error}`);
    }
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedMedia.length > 4) {
      toast.error("You can only upload up to 4 images");
      return;
    }

    // Add files to state with uploading status
    const newMedia: UploadedMedia[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));

    const startIndex = uploadedMedia.length;
    setUploadedMedia((prev) => [...prev, ...newMedia]);

    // Start uploading each file
    files.forEach((file, i) => {
      uploadFile(file, startIndex + i);
    });

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    const media = uploadedMedia[index];
    if (media) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    reset();
    uploadedMedia.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setUploadedMedia([]);
    onClose();
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      // Build media array from successfully uploaded files
      const media: PostMedia[] = uploadedMedia
        .filter((m) => m.uploadedUrl && !m.error)
        .map((m) => ({
          url: m.uploadedUrl!,
          type: m.type || "image",
        }));

      if (isEditing && postToEdit) {
        await updatePost.mutateAsync({
          postId: postToEdit.id,
          data: {
            content: data.content,
            visibility: data.visibility,
          },
        });
      } else {
        await createPost.mutateAsync({
          content: data.content,
          visibility: data.visibility,
          media: media.length > 0 ? media : undefined,
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

  const isPending =
    createPost.isPending || updatePost.isPending || isMediaUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 bg-background dark:bg-zinc-900 border-border/50 gap-0"
    >
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              <SimpleDropdown
                value={visibility}
                onChange={(val) => setValue("visibility", val)}
                options={visibilityOptions}
                triggerClassName="text-muted-foreground/80 hover:text-foreground font-medium transition-colors"
              />
            </div>
          </div>

          {/* Content Input */}
          <div className="py-2 min-h-[160px]">
            <MentionTextarea
              {...register("content", {
                required: "Write something to post",
                maxLength: {
                  value: maxChars,
                  message: `Max ${maxChars} characters`,
                },
              })}
              value={watch("content") || ""}
              suggestions={suggestions}
              onSearch={setSearchValue}
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
          {uploadedMedia.length > 0 && (
            <div
              className={cn(
                "grid gap-2 mb-4",
                uploadedMedia.length === 1 && "grid-cols-1",
                uploadedMedia.length === 2 && "grid-cols-2",
                uploadedMedia.length >= 3 && "grid-cols-2",
              )}
            >
              {uploadedMedia.map((media, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-muted flex items-center justify-center",
                    uploadedMedia.length === 1 && "aspect-video",
                    uploadedMedia.length >= 2 && "aspect-square",
                  )}
                >
                  {media.file.type.startsWith("image/") ? (
                    <img
                      src={media.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className={cn(
                        "w-full h-full object-cover",
                        media.isUploading && "opacity-50",
                      )}
                    />
                  ) : media.file.type.startsWith("video/") ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media.previewUrl}
                        className={cn(
                          "w-full h-full object-cover",
                          media.isUploading && "opacity-50",
                        )}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Video className="h-8 w-8 text-white/70" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <FileText className="h-10 w-10 text-blue-500" />
                      <span className="text-xs font-medium truncate max-w-full px-2">
                        {media.file.name}
                      </span>
                    </div>
                  )}

                  {/* Upload spinner overlay */}
                  {media.isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  {/* Error indicator */}
                  {media.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                      <span className="text-xs text-white bg-red-600 px-2 py-1 rounded">
                        Upload failed
                      </span>
                    </div>
                  )}
                  {/* Success checkmark */}
                  {media.uploadedUrl && !media.isUploading && (
                    <div className="absolute bottom-2 left-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
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
                accept="image/*,video/*,.pdf,.doc,.docx"
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
                tooltip="Add media (Image, Video, PDF)"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedMedia.length >= 4}
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
    </Modal>
  );
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
              className,
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
