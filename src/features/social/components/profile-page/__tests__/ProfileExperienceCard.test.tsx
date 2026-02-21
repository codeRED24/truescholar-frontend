import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileExperienceCard } from "../ProfileExperienceCard";

describe("ProfileExperienceCard", () => {
  it("renders experience entries", () => {
    render(
      <ProfileExperienceCard
        experience={[
          {
            id: "exp-1",
            company: "Acme Labs",
            role: "Senior Product Designer",
            startDate: "2022-01-01T00:00:00.000Z",
            endDate: null,
            isCurrent: true,
            description: "Built social feed UX patterns.",
          },
        ]}
      />,
    );

    expect(screen.getByText("Senior Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Acme Labs")).toBeInTheDocument();
    expect(screen.getByText("Built social feed UX patterns.")).toBeInTheDocument();
    expect(screen.getByText(/Present/i)).toBeInTheDocument();
  });

  it("renders empty state when no experience exists", () => {
    render(<ProfileExperienceCard experience={[]} />);
    expect(screen.getByText("No experience listed yet.")).toBeInTheDocument();
  });
});
