import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PostActions } from "../PostActions";

const { mockToggleExpandedComments, mockLikeToggle } = vi.hoisted(() => ({
  mockToggleExpandedComments: vi.fn(),
  mockLikeToggle: vi.fn(),
}));

vi.mock("@/features/social/hooks/use-likes", () => ({
  useLikePost: () => ({
    toggle: mockLikeToggle,
    isLoading: false,
  }),
}));

vi.mock("@/features/social/stores/feed-store", () => ({
  useFeedStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      toggleExpandedComments: mockToggleExpandedComments,
      reactionAuthor: null,
    }),
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));

vi.mock("@/features/social/components/post/ReactionAuthorSelector", () => ({
  ReactionAuthorSelector: () => <div data-testid="reaction-author-selector" />,
}));

vi.mock("@/features/social/components/post/PostLikesModal", () => ({
  PostLikesModal: () => null,
}));

describe("PostActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses onCommentClick override for comment entry points", () => {
    const onCommentClick = vi.fn();

    render(
      <PostActions
        postId="post-1"
        likeCount={0}
        commentCount={2}
        hasLiked={false}
        onCommentClick={onCommentClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2 comments" }));
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    expect(onCommentClick).toHaveBeenCalledTimes(2);
    expect(onCommentClick).toHaveBeenNthCalledWith(1, "post-1");
    expect(onCommentClick).toHaveBeenNthCalledWith(2, "post-1");
    expect(mockToggleExpandedComments).not.toHaveBeenCalled();
  });

  it("falls back to toggleExpandedComments when onCommentClick is not provided", () => {
    render(
      <PostActions
        postId="post-1"
        likeCount={0}
        commentCount={2}
        hasLiked={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2 comments" }));
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    expect(mockToggleExpandedComments).toHaveBeenCalledTimes(2);
    expect(mockToggleExpandedComments).toHaveBeenNthCalledWith(1, "post-1");
    expect(mockToggleExpandedComments).toHaveBeenNthCalledWith(2, "post-1");
  });
});
