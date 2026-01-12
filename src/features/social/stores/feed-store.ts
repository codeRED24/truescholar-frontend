// Social Feed Store
// Zustand store for UI-only state (not server data)

import { create } from "zustand";

interface FeedState {
  // Composer state
  isComposerOpen: boolean;
  composerContent: string;

  // Reply state
  replyingToPostId: string | null;
  replyingToCommentId: string | null;

  // Expanded comments tracking
  expandedComments: Set<string>;

  // Actions
  openComposer: () => void;
  closeComposer: () => void;
  setComposerContent: (content: string) => void;

  setReplyingTo: (postId: string, commentId?: string) => void;
  clearReplyingTo: () => void;

  toggleExpandedComments: (postId: string) => void;
  isCommentsExpanded: (postId: string) => boolean;

  // Reset
  reset: () => void;
}

const initialState = {
  isComposerOpen: false,
  composerContent: "",
  replyingToPostId: null,
  replyingToCommentId: null,
  expandedComments: new Set<string>(),
};

export const useFeedStore = create<FeedState>((set, get) => ({
  ...initialState,

  openComposer: () => set({ isComposerOpen: true }),
  closeComposer: () => set({ isComposerOpen: false, composerContent: "" }),
  setComposerContent: (content) => set({ composerContent: content }),

  setReplyingTo: (postId, commentId) =>
    set({
      replyingToPostId: postId,
      replyingToCommentId: commentId ?? null,
    }),

  clearReplyingTo: () =>
    set({
      replyingToPostId: null,
      replyingToCommentId: null,
    }),

  toggleExpandedComments: (postId) => {
    const current = get().expandedComments;
    const next = new Set(current);

    if (next.has(postId)) {
      next.delete(postId);
    } else {
      next.add(postId);
    }

    set({ expandedComments: next });
  },

  isCommentsExpanded: (postId) => get().expandedComments.has(postId),

  reset: () => set(initialState),
}));
