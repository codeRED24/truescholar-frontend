import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileEducationCard } from "../ProfileEducationCard";

describe("ProfileEducationCard", () => {
  it("renders education entries", () => {
    render(
      <ProfileEducationCard
        education={[
          {
            id: "edu-1",
            collegeId: 10,
            collegeName: "Aj University",
            courseId: 12,
            courseName: "BSc, Human-Computer Interaction",
            fieldOfStudy: "Design",
            startYear: 2018,
            endYear: 2022,
            grade: "A",
            description: "Focused on research and product thinking.",
          },
        ]}
      />,
    );

    expect(screen.getByText("Aj University")).toBeInTheDocument();
    expect(screen.getByText("BSc, Human-Computer Interaction")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("2018 - 2022")).toBeInTheDocument();
    expect(screen.getByText("Grade: A")).toBeInTheDocument();
  });

  it("renders empty state when no education exists", () => {
    render(<ProfileEducationCard education={[]} />);
    expect(screen.getByText("No education listed yet.")).toBeInTheDocument();
  });
});
