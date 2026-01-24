// Post Composer Component
// Modal/form for creating new posts with media upload
// Supports multi-step flow for settings

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MentionTextarea } from "@/components/ui/mention-textarea";
import { X, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useCreatePost, useUpdatePost } from "../../hooks/use-post";
import { uploadPostMedia } from "../../api/social-api";
import { useCollegeMemberships } from "../../hooks/use-memberships";
import {
  isApiError,
  type PostVisibility,
  Author,
  Post,
  PostMedia,
  Member,
  AuthorType,
} from "../../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Sub-components
import { ComposerHeader } from "./ComposerHeader";
import { ComposerToolbar } from "./ComposerToolbar";
import { MediaPreviewGrid, UploadedMedia } from "./MediaPreviewGrid";
import { PostSettingsModal } from "./PostSettingsModal";
import { PostingAsModal } from "./PostingAsModal";
import { CollegeSelectorModal } from "./CollegeSelectorModal";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: Author;
  postToEdit?: Post | null;
}

interface PostFormData {
  content: string;
}

export function PostComposer({
  isOpen,
  onClose,
  currentUser,
  postToEdit,
}: PostComposerProps) {
  // --- State ---
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const { data: allMemberships = [] } = useCollegeMemberships();
  
  // Filter for admin memberships only
  const collegeMemberships = allMemberships.filter(
    (m) => m.role === "college_admin"
  );
  
  // Settings State
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [selectedAuthor, setSelectedAuthor] = useState<{
    type: AuthorType;
    id: string; // userId or collegeId
    name: string;
    image?: string;
  }>({
    type: "user",
    id: currentUser?.id || "",
    name: currentUser?.name || "You",
    image: currentUser?.image,
  });

  // Modal State
  const [activeModal, setActiveModal] = useState<"composer" | "settings" | "postingAs" | "collegeSelector">("composer");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!postToEdit;

  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // --- Effects ---

  useEffect(() => {
    // Reset state when opening fresh
    if (isOpen && !isEditing) {
      // Reset to defaults
      setVisibility("public");
      setSelectedAuthor({
        type: "user",
        id: currentUser?.id || "",
        name: currentUser?.name || "You",
        image: currentUser?.image,
      });
      setUploadedMedia([]);
      setActiveModal("composer");
    } else if (isOpen && isEditing && postToEdit) {
      // Load existing post data
      setVisibility(postToEdit.visibility);
      // We don't support changing author of existing post
      setSelectedAuthor({
        type: postToEdit.authorType || "user",
        id: postToEdit.authorType === "college" 
          ? postToEdit.taggedCollege?.college_id.toString() || "" 
          : postToEdit.author.id,
        name: postToEdit.authorType === "college" 
          ? postToEdit.taggedCollege?.college_name || "College" 
          : postToEdit.author.name,
        image: postToEdit.authorType === "college"
          ? postToEdit.taggedCollege?.logo_img
          : postToEdit.author.image,
      });
      // Load existing media as read-only preview is handled in render
    }
  }, [isOpen, isEditing, postToEdit, currentUser]);

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
    },
  });

  // Update form content when postToEdit changes
  useEffect(() => {
    if (postToEdit) {
      setValue("content", postToEdit.content);
    }
  }, [postToEdit, setValue]);

  const content = watch("content");
  const charCount = content?.length || 0;
  const maxChars = 3000;
  const isMediaUploading = uploadedMedia.some((m) => m.isUploading);

  // --- Handlers ---

  const handleClose = () => {
    reset();
    uploadedMedia.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setUploadedMedia([]);
    setActiveModal("composer");
    onClose();
  };

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

    const newMedia: UploadedMedia[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));

    const startIndex = uploadedMedia.length;
    setUploadedMedia((prev) => [...prev, ...newMedia]);

    files.forEach((file, i) => {
      uploadFile(file, startIndex + i);
    });

    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    const media = uploadedMedia[index];
    if (media) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PostFormData) => {
    try {
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
            visibility: visibility,
          },
        });
      } else {
        await createPost.mutateAsync({
          content: data.content,
          visibility: visibility,
          media: media.length > 0 ? media : undefined,
          authorType: selectedAuthor.type,
          taggedCollegeId:
            selectedAuthor.type === "college"
              ? parseInt(selectedAuthor.id)
              : undefined,
        });
      }
      handleClose();
    } catch {
      // Toast handled by hooks
    }
  };

  const isPending = createPost.isPending || updatePost.isPending || isMediaUploading;

  // --- Render ---

  // 1. Settings Modal
  if (activeModal === "settings") {
    return (
      <PostSettingsModal
        isOpen={isOpen}
        onClose={() => setActiveModal("composer")}
        visibility={visibility}
        setVisibility={setVisibility}
        selectedAuthor={selectedAuthor}
        onOpenAuthorSelection={() => setActiveModal("postingAs")}
        onOpenCollegeSelection={() => setActiveModal("collegeSelector")}
      />
    );
  }

  // 2. Posting As Modal
  if (activeModal === "postingAs") {
    return (
        <PostingAsModal
            isOpen={isOpen}
            onClose={() => setActiveModal("composer")}
            onBack={() => setActiveModal("settings")}
            currentUser={{
                id: currentUser?.id || "",
                name: currentUser?.name || "You",
                image: currentUser?.image
            }}
            collegeMemberships={collegeMemberships}
            selectedAuthor={selectedAuthor}
            onSelect={(author) => {
                setSelectedAuthor(author);
                setActiveModal("settings");
            }}
        />
    );
  }

  // 3. College Selector Modal
  if (activeModal === "collegeSelector") {
      return (
          <CollegeSelectorModal
            isOpen={isOpen}
            onClose={() => setActiveModal("composer")}
            onBack={() => setActiveModal("settings")}
          />
      );
  }

  // 4. Main Composer Modal
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
          {/* Header */}
          <ComposerHeader 
            authorName={selectedAuthor.name}
            authorImage={selectedAuthor.image}
            authorType={selectedAuthor.type}
            visibility={visibility}
            onAuthorClick={() => !isEditing && setActiveModal("settings")}
          />

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

          {/* Media Previews (Existing - Read Only) */}
          {postToEdit?.media && postToEdit.media.length > 0 && isEditing && (
             <div className="mb-4">
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
          <MediaPreviewGrid 
            media={uploadedMedia}
            onRemove={removeMedia}
          />
        </form>
      </div>

      {/* Footer Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/5 dark:bg-muted/10 gap-4 shrink-0">
        <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0 no-scroll-bar">
          {!isEditing ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={handleMediaSelect}
              />
              <ComposerToolbar 
                onMediaSelect={() => fileInputRef.current?.click()}
                isMediaDisabled={uploadedMedia.length >= 4}
              />
            </>
          ) : (
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
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!content?.trim() || charCount > maxChars || isPending}
            className={cn(
                "rounded-full px-6 py-2 font-bold text-base shadow-sm transition-all flex items-center gap-2",
                !content?.trim() || charCount > maxChars || isPending 
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
            )}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Save" : "Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
