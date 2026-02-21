import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileHeroCard } from "../ProfileHeroCard";

const baseProps = {
  profile: {
    user_id: "user-1",
    bio: "Product designer and mentor",
    experience: [],
    education: [],
    linkedin_url: null,
    twitter_url: null,
    github_url: null,
    website_url: null,
    city: "Pune",
    state: "Maharashtra",
    skills: [],
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  },
  profileUser: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: null,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  followersCount: 1234,
  followingCount: 89,
  isFollowing: false,
  isFollowLoading: false,
  onToggleFollow: vi.fn(async () => undefined),
};

describe("ProfileHeroCard", () => {
  it("renders follow + disabled message/more for non-owner authenticated user", () => {
    render(
      <ProfileHeroCard
        {...baseProps}
        isOwner={false}
        isAuthenticated
      />,
    );

    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /message/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /more actions/i })).toBeDisabled();
  });

  it("hides follow button for owner", () => {
    render(
      <ProfileHeroCard
        {...baseProps}
        isOwner
        isAuthenticated
      />,
    );

    expect(screen.queryByRole("button", { name: "Follow" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /message/i })).toBeDisabled();
  });

  it("renders follower/following stats and hides public email", () => {
    render(
      <ProfileHeroCard
        {...baseProps}
        isOwner={false}
        isAuthenticated
      />,
    );

    expect(screen.getByText(/followers/i)).toBeInTheDocument();
    expect(screen.getByText(/following/i)).toBeInTheDocument();
    expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
  });
});
