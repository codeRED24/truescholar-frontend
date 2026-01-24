// Posting As Selection Modal
// Sub-modal to select between user and college profiles
"use client";

import { X, ArrowLeft } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AuthorRow } from "../shared/AuthorRow";
import type { Member, AuthorType } from "../../types";

interface PostingAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  currentUser: { id: string; name: string; image?: string };
  collegeMemberships: Member[];
  selectedAuthor: { id: string; type: AuthorType };
  onSelect: (author: { id: string; type: AuthorType; name: string; image?: string }) => void;
}

export function PostingAsModal({
  isOpen,
  onClose,
  onBack,
  currentUser,
  collegeMemberships,
  selectedAuthor,
  onSelect,
}: PostingAsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-[500px] p-0 bg-background dark:bg-zinc-900 border-border/50 gap-0"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Posting as</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-2 overflow-y-auto max-h-[60vh]">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Your Account
        </div>
        <AuthorRow
          id={currentUser.id}
          name={currentUser.name}
          image={currentUser.image}
          type="user"
          isSelected={selectedAuthor.type === "user"}
          onClick={() => {
            onSelect({
              id: currentUser.id,
              type: "user",
              name: currentUser.name,
              image: currentUser.image,
            });
          }}
        />

        {collegeMemberships.length > 0 && (
          <>
            <div className="px-3 py-2 mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Manage Pages
            </div>
            {collegeMemberships.map((membership) => (
              <AuthorRow
                key={membership.college.college_id}
                id={membership.college.college_id.toString()}
                name={membership.college.college_name}
                image={membership.college.logo_img}
                type="college"
                isSelected={
                  selectedAuthor.type === "college" &&
                  selectedAuthor.id === membership.college.college_id.toString()
                }
                onClick={() => {
                  onSelect({
                    id: membership.college.college_id.toString(),
                    type: "college",
                    name: membership.college.college_name,
                    image: membership.college.logo_img,
                  });
                }}
              />
            ))}
          </>
        )}
      </div>
    </Modal>
  );
}
