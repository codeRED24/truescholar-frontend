import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileSidebar } from "../ProfileSidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

describe("ProfileSidebar", () => {
  it("renders public URL and placeholder people also viewed", () => {
    render(<ProfileSidebar profileHandle="manuj" />);

    expect(screen.getByText("truescholar.com/feed/profile/manuj")).toBeInTheDocument();
    expect(screen.getByText("Aisha Khan")).toBeInTheDocument();
    expect(screen.getByText("Rahul Verma")).toBeInTheDocument();

    const viewButtons = screen.getAllByRole("button", { name: "View" });
    expect(viewButtons).toHaveLength(2);
    viewButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
