import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProfileRecentActivityCenter } from "../ProfileRecentActivityCenter";
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

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/features/social/components/post/PostCard", () => ({
  PostCard: ({ post }: { post: { id: string; content: string } }) => (
    <div data-testid="post-card">{`${post.id}:${post.content}`}</div>
  ),
}));

vi.mock("@/features/social/components/post/PostComposer", () => ({
  PostComposer: ({
    isOpen,
  }: {
    isOpen: boolean;
  }) => (isOpen ? <div data-testid="post-composer">composer</div> : null),
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

describe("ProfileRecentActivityCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockReset();
    vi.mocked(useUserPostsActivity).mockReturnValue(createPostsActivityState());
    vi.mocked(useUserCommentsActivity).mockReturnValue(createCommentsActivityState());
  });

  it("renders post cards in posts tab", () => {
    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "First post",
            author: { id: "user-1", name: "Test User" },
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
      <ProfileRecentActivityCenter
        activityUserId="user-1"
        profileHandle="manuj"
        activeTab="posts"
        isOwner={false}
      />,
    );

    expect(screen.getByTestId("post-card")).toHaveTextContent("post-1:First post");
  });

  it("renders comment activity rows in comments tab", () => {
    vi.mocked(useUserCommentsActivity).mockReturnValue(
      createCommentsActivityState({
        items: [
          {
            id: "comment-1",
            postId: "post-1",
            content: "Great write-up.",
            createdAt: "2026-02-21T00:00:00.000Z",
            likeCount: 0,
            replyCount: 0,
            hasLiked: false,
            post: {
              id: "post-1",
              content: "Source post content",
              createdAt: "2026-02-21T00:00:00.000Z",
            },
            author: {
              id: "user-1",
              name: "Manuj",
              image: null,
              type: "user",
            },
          },
        ],
      }),
    );

    render(
      <ProfileRecentActivityCenter
        activityUserId="user-1"
        profileHandle="manuj"
        activeTab="comments"
        isOwner={false}
      />,
    );

    expect(screen.getByText(/Manuj commented/i)).toBeInTheDocument();
    expect(screen.getByText(/Great write-up/i)).toBeInTheDocument();
  });

  it("calls fetchNextPage from fallback Load more button", () => {
    const fetchNextPage = vi.fn(async () => undefined);

    vi.mocked(useUserPostsActivity).mockReturnValue(
      createPostsActivityState({
        items: [
          {
            id: "post-1",
            content: "First post",
            author: { id: "user-1", name: "Test User" },
            media: [],
            visibility: "public",
            likeCount: 1,
            commentCount: 0,
            hasLiked: false,
            createdAt: "2026-02-21T00:00:00.000Z",
            updatedAt: "2026-02-21T00:00:00.000Z",
          },
        ],
        hasNextPage: true,
        fetchNextPage,
      }),
    );

    render(
      <ProfileRecentActivityCenter
        activityUserId="user-1"
        profileHandle="manuj"
        activeTab="posts"
        isOwner={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("shows owner-only create post action", () => {
    render(
      <ProfileRecentActivityCenter
        activityUserId="user-1"
        profileHandle="manuj"
        activeTab="posts"
        isOwner
        currentUser={{ id: "user-1", name: "Manuj" }}
      />,
    );

    expect(screen.getByRole("button", { name: "Create post" })).toBeInTheDocument();
  });
});
