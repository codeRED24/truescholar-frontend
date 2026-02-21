import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import ProfilePageRedirect from "../page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("/profile redirect page", () => {
  it("redirects to /feed/profile", () => {
    ProfilePageRedirect();
    expect(redirect).toHaveBeenCalledWith("/feed/profile");
  });
});
