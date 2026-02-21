import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileSidebar } from "../ProfileSidebar";

describe("ProfileSidebar", () => {
  it("renders public URL and placeholder people also viewed", () => {
    render(<ProfileSidebar userId="user-123" />);

    expect(screen.getByText("truescholar.com/feed/profile/user-123")).toBeInTheDocument();
    expect(screen.getByText("Aisha Khan")).toBeInTheDocument();
    expect(screen.getByText("Rahul Verma")).toBeInTheDocument();

    const viewButtons = screen.getAllByRole("button", { name: "View" });
    expect(viewButtons).toHaveLength(2);
    viewButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
