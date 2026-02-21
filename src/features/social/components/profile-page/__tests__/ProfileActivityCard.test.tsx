import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProfileActivityCard } from "../ProfileActivityCard";
import {
  useUserCommentsActivity,
  useUserPostsActivity,
} from "@/features/social/hooks/use-profile-activity";

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock("@/features/social/hooks/use-profile-activity", () => ({
  useUserPostsActivity: vi.fn(),
  useUserCommentsActivity: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/features/social/components/post/PostCard", () => ({
  PostCard: ({
    post,
    onCommentClick,
  }: {
    post: { id: string; content: string };
    onCommentClick?: (postId: string) => void;
  }) => (
    <div data-testid={`post-card-${post.id}`}>
      <span>{post.content}</span>
      <button type="button" onClick={() => onCommentClick?.(post.id)}>
        Comment
      </button>
    </div>
  ),
}));

type PostsActivityState = ReturnType<typeof useUserPostsActivity>;
type CommentsActivityState = ReturnType<typeof useUserCommentsActivity>;

function createPostsActivityState(
  overrides: Partial<PostsActivityState> = {},
): PostsActivityState {
  return {
    items: [],
    nextCursor: null,
    hasNextPage: false,
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(async () => undefined),
    refetch: vi.fn(async () => undefined),
    ...overrides,
  };
}

function createCommentsActivityState(
  overrides: Partial<CommentsActivityState> = {},
): CommentsActivityState {
  return {
    items: [],
    nextCursor: null,
    hasNextPage: false,
    isLoading: false,
    isError: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(async () => undefined),
    refetch: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("ProfileActivityCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReset();
    vi.mocked(useUserPostsActivity).mockReturnValue(createPostsActivityState());
    vi.mocked(useUserCommentsActivity).mockReturnValue(createCommentsActivityState());
  });

  it("renders real post activity entries", () => {
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "Designing for focused learners",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 12,
            commentCount: 4,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
        ],
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );

    expect(screen.getByText(/Designing for focused learners/i)).toBeInTheDocument();
    expect(screen.getByTestId("post-card-post-1")).toBeInTheDocument();
  });

  it("opens post detail when post comment action is clicked", () => {
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "Designing for focused learners",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 12,
            commentCount: 4,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
        ],
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    expect(mockPush).toHaveBeenCalledWith("/feed/post/post-1");
  });

  it("renders comment activity entries when switching to comments tab", () => {
    vi.mocked(useUserCommentsActivity).mockReturnValue(
      createCommentsActivityState({
        items: [
          {
            id: "comment-1",
            postId: "post-1",
            content: "Great perspective on profile UX.",
            createdAt: "2026-02-21T00:00:00.000Z",
            likeCount: 3,
            replyCount: 1,
            hasLiked: false,
            post: {
              id: "post-1",
              content: "Original post content",
              createdAt: "2026-02-21T00:00:00.000Z",
            },
            author: {
              id: "user-1",
              name: "John",
              image: null,
              type: "user",
            },
          },
        ],
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comments" }));

    expect(screen.getByText(/Great perspective on profile UX/i)).toBeInTheDocument();
    expect(screen.getByText(/john commented/i)).toBeInTheDocument();
  });

  it("shows empty state for posts when no activity exists", () => {
    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );
    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
  });

  it("redirects to posts recent-activity page on See more", () => {
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "Post one",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
        ],
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "See more" }));

    expect(mockPush).toHaveBeenCalledWith("/feed/profile/manuj/recent-activity/all");
  });

  it("redirects to comments recent-activity page when comments tab is active", () => {
    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comments" }));
    fireEvent.click(screen.getByRole("button", { name: "See more" }));

    expect(mockPush).toHaveBeenCalledWith(
      "/feed/profile/manuj/recent-activity/comments",
    );
  });

  it("hides previous arrow on first slide and next arrow on last slide", () => {
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "Post one",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
          {
            id: "post-2",
            content: "Post two",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
          {
            id: "post-3",
            content: "Post three",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
        ],
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );

    expect(screen.queryByRole("button", { name: "Previous posts" })).not.toBeInTheDocument();
    const nextButton = screen.getByRole("button", { name: "Next posts" });
    fireEvent.click(nextButton);

    expect(screen.queryByRole("button", { name: "Next posts" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous posts" })).toBeInTheDocument();
  });

  it("shows teaser card on the 4th item and routes on teaser see more", () => {
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "Post one",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
          {
            id: "post-2",
            content: "Post two",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
          {
            id: "post-3",
            content: "Post three",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
          {
            id: "post-4",
            content: "Post four",
            author: { id: "user-1", name: "John" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
        ],
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next posts" }));
    fireEvent.click(screen.getByRole("button", { name: "Next posts" }));

    expect(screen.getByTestId("posts-teaser-card")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "See more" }));
    expect(mockPush).toHaveBeenCalledWith("/feed/profile/manuj/recent-activity/all");
  });

  it("shows retry state on activity fetch error", () => {
    const refetch = vi.fn(async () => undefined);
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        isError: true,
        refetch,
      }),
    );

    render(
      <ProfileActivityCard activityUserId="user-1" profileHandle="manuj" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
