// Social Module - Public API
// Single entry point for all social features

// Types
export * from "./types";

// Hooks
export {
  useFeed,
  useGuestFeed,
  useFlattenedFeed,
  feedKeys,
} from "./hooks/use-feed";
export {
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  postKeys,
} from "./hooks/use-post";
export { useToggleLike, useLikePost } from "./hooks/use-likes";
export {
  useComments,
  useFlattenedComments,
  useCreateComment,
  useDeleteComment,
  useToggleCommentLike,
  commentKeys,
} from "./hooks/use-comments";

// Store
export { useFeedStore } from "./stores/feed-store";

// Components
export { Feed } from "./components/feed/Feed";
export { FeedEmpty } from "./components/feed/FeedEmpty";
export { PostCard, type PostCardVariant } from "./components/post/PostCard";
export { PostActions } from "./components/post/PostActions";
export { PostSkeleton, PostSkeletonList } from "./components/post/PostSkeleton";
export { PostComposer } from "./components/post/PostComposer";
export { ComposerTrigger } from "./components/post/ComposerTrigger";
export { InlineComposer } from "./components/post/InlineComposer";
export * from "./components/sidebar";
export * from "./components/layout";
export { CommentSection } from "./components/comments/CommentSection";
export { CommentItem } from "./components/comments/CommentItem";
export { AuthorHeader } from "./components/shared/AuthorHeader";
export { MediaGallery } from "./components/shared/MediaGallery";
export { MessagingWidget } from "./components/shared/MessagingWidget";

// Network
export * from "./components/network";
export {
  useSuggestions,
  useFollowers,
  useFollowing,
  useFollowerStats,
  useFollowUser,
  useUnfollowUser,
  networkKeys,
} from "./hooks/use-network";

// Utils
export * from "./utils/formatters";
