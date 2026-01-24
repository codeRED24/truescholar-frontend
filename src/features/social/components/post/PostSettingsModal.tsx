// Post Settings Modal
// Main settings panel for a post (Visibility, Author, Comments, etc.)
"use client";

import { X, MessageSquare, Handshake } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsRow } from "../shared/SettingsRow";
import { VisibilityOptions } from "./VisibilityOptions";
import type { PostVisibility, AuthorType } from "../../types";

interface PostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // State
  visibility: PostVisibility;
  setVisibility: (v: PostVisibility) => void;
  selectedAuthor: { id: string; type: AuthorType; name: string; image?: string };
  // Navigation
  onOpenAuthorSelection: () => void;
  onOpenCollegeSelection: () => void; // Used if "College only" is selected
}

export function PostSettingsModal({
  isOpen,
  onClose,
  visibility,
  setVisibility,
  selectedAuthor,
  onOpenAuthorSelection,
  onOpenCollegeSelection,
}: PostSettingsModalProps) {
  
  const handleVisibilityChange = (val: PostVisibility) => {
    setVisibility(val);
    if (val === "college" && selectedAuthor.type === "user") {
        onOpenCollegeSelection();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-[500px] p-0 bg-background dark:bg-zinc-900 border-border/50 gap-0"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Post settings</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-0 overflow-y-auto max-h-[70vh]">
        {/* Author Section */}
        <div className="p-2">
            <h3 className="text-sm font-semibold mb-1 px-2 text-muted-foreground uppercase tracking-wider mt-2">
                Posting as
            </h3>
            <SettingsRow
                label={selectedAuthor.name}
                value={selectedAuthor.type === "college" ? "College Page" : "Personal Account"}
                onClick={onOpenAuthorSelection}
                className="rounded-lg"
            />
        </div>
        
        <div className="h-px bg-border/50 mx-4 my-1" />

        {/* Visibility Section */}
        <VisibilityOptions
          value={visibility}
          onChange={handleVisibilityChange}
          authorType={selectedAuthor.type}
        />

        <div className="h-px bg-border/50 mx-4 my-1" />

        {/* Comment Controls */}
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <div className="font-medium">Allow comments</div>
                        <div className="text-sm text-muted-foreground">Let people comment on this post</div>
                    </div>
                </div>
                <Switch defaultChecked onCheckedChange={() => {}} />
            </div>

            <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                    <Handshake className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <div className="font-medium">Brand partnership</div>
                        <div className="text-sm text-muted-foreground">Mark this post as sponsored</div>
                    </div>
                </div>
                <Switch disabled />
            </div>
        </div>
      </div>
      
      <div className="p-4 border-t flex justify-end gap-2">
        <Button onClick={onClose} className="w-full sm:w-auto">
            Done
        </Button>
      </div>
    </Modal>
  );
}
