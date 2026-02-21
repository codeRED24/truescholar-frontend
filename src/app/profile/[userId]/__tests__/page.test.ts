import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import ProfileUserAliasPage from "../page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("/profile/[userId] redirect page", () => {
  it("redirects to /feed/profile/[userId]", async () => {
    await ProfileUserAliasPage({
      params: Promise.resolve({ userId: "user-123" }),
    });

    expect(redirect).toHaveBeenCalledWith("/feed/profile/user-123");
  });
});
