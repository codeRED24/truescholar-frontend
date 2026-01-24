// College Selector Modal
// Select a college for "College Only" visibility
"use client";

import { useState } from "react";
import { X, ArrowLeft, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CollegeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function CollegeSelectorModal({
  isOpen,
  onClose,
  onBack,
}: CollegeSelectorModalProps) {
  const [search, setSearch] = useState("");

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
          <h2 className="text-lg font-semibold">Select College</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p>Search for a college to limit visibility.</p>
            <p className="text-xs mt-2 opacity-60">(Feature coming soon)</p>
        </div>
      </div>
      
      <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
      </div>
    </Modal>
  );
}
