import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfileRecentActivityAllPage from "../page";

vi.mock(
  "@/features/social/components/profile-page/ProfileRecentActivityPage",
  () => ({
    ProfileRecentActivityPage: ({
      profileHandle,
      initialTab,
    }: {
      profileHandle: string;
      initialTab: string;
    }) => <div>{`recent-activity:${profileHandle}:${initialTab}`}</div>,
  }),
);

describe("/feed/profile/[userId]/recent-activity/all page", () => {
  it("initializes posts tab", async () => {
    const page = await ProfileRecentActivityAllPage({
      params: Promise.resolve({ userId: "user-123" }),
    });

    render(page);
    expect(
      screen.getByText("recent-activity:user-123:posts"),
    ).toBeInTheDocument();
  });
});
