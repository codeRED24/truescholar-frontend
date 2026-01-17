# Social Module

Decoupled, flexible social media features for TrueScholar. Designed for easy UI iteration.

## Quick Start

```tsx
import { Feed, PostCard, useFeed } from "@/features/social";

// Full feed with infinite scroll
<Feed isAuthenticated={true} currentUserId="user-123" />;

// Custom layout with hooks
const { posts, fetchNextPage } = useFlattenedFeed();
```

---

## Structure

```
src/features/social/
├── index.ts          # Public exports
├── types/            # TypeScript definitions
├── api/              # API client
├── hooks/            # React Query hooks
├── stores/           # Zustand UI state
├── components/       # UI components
└── utils/            # Formatters
```

---

## Hooks

### `useFeed(options?)`

Infinite scroll feed with cursor pagination.

```tsx
const { data, fetchNextPage, hasNextPage, isLoading } = useFeed();
```

### `useFlattenedFeed(options?)`

Same as `useFeed` but returns flattened posts array.

```tsx
const { posts, isEmpty, fetchNextPage } = useFlattenedFeed();
```

### `useGuestFeed(options?)`

Trending-only feed for non-authenticated users.

### `usePost(postId)`

Fetch a single post.

```tsx
const { data: post, isLoading } = usePost("post-123");
```

### `useCreatePost()`

Create a new post with optional media.

```tsx
const createPost = useCreatePost();
createPost.mutate({ content: "Hello!", visibility: "public" });
```

### `useToggleLike()` / `useLikePost(postId, isLiked)`

Like/unlike with optimistic updates.

```tsx
const { toggle, isLoading } = useLikePost("post-123", false);
<button onClick={toggle}>Like</button>;
```

### `useComments(postId)` / `useFlattenedComments(postId)`

Paginated comments for a post.

### `useCreateComment(postId)`

Add a comment (with optional `parentId` for replies).

```tsx
const createComment = useCreateComment("post-123");
createComment.mutate({ content: "Great post!" });
```

---

## Components

### `<Feed />`

Main feed container with infinite scroll.

| Prop              | Type           | Description                          |
| ----------------- | -------------- | ------------------------------------ |
| `isAuthenticated` | `boolean`      | Show personalized vs guest feed      |
| `currentUserId`   | `string?`      | For showing edit/delete on own posts |
| `onAuthorClick`   | `(id) => void` | Navigate to profile                  |

### `<PostCard />`

Single post display with variants.

| Prop       | Type                                 | Description              |
| ---------- | ------------------------------------ | ------------------------ |
| `post`     | `Post`                               | Post data                |
| `variant`  | `'default' \| 'compact' \| 'detail'` | Layout style             |
| `onEdit`   | `(post) => void`                     | Edit handler (own posts) |
| `onDelete` | `(id) => void`                       | Delete handler           |

### `<CommentSection postId={string} />`

Comments list with input form.

### `<AuthorHeader author={Author} createdAt={string} />`

Avatar + name + timestamp.

### `<MediaGallery media={PostMedia[]} />`

Responsive image/video grid with lightbox.

### `<PostSkeleton />` / `<PostSkeletonList count={3} />`

Loading placeholders.

---

## Store

```tsx
import { useFeedStore } from "@/features/social";

// Composer
const { isComposerOpen, openComposer, closeComposer } = useFeedStore();

// Comments expansion
const { toggleExpandedComments, isCommentsExpanded } = useFeedStore();
```

---

## Types

```tsx
interface Post {
  id: string;
  content: string;
  author: Author;
  media: PostMedia[];
  visibility: "public" | "connections" | "private";
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  author: Author;
  likeCount: number;
  hasLiked: boolean;
  parentId: string | null;
}

interface Author {
  id: string;
  name: string;
  image: string | null;
  isVerified?: boolean;
}
```

---

## Utils

```tsx
import { formatRelativeTime, formatCount } from "@/features/social";

formatRelativeTime("2026-01-05T10:00:00Z"); // "5h"
formatCount(1234); // "1.2K"
```

---

## Extending

1. **New hook**: Add to `hooks/`, export from `index.ts`
2. **New component**: Add to `components/`, export from `index.ts`
3. **New API endpoint**: Add to `api/social-api.ts`

All changes remain isolated within `src/features/social/`.
