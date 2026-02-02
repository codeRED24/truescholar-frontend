"use client";

import { CollegeProfileResponse } from "../../types";
import { CommunityCard } from "./CommunityCard";
import { AlumniCard } from "./AlumniCard";
import { PeopleAlsoViewedCard } from "./PeopleAlsoViewedCard";

interface CollegeSidebarProps {
  profile: CollegeProfileResponse;
  slugId: string;
}

export function CollegeSidebar({ profile, slugId }: CollegeSidebarProps) {
  return (
    <div className="space-y-4">
      <CommunityCard profile={profile} />
      <PeopleAlsoViewedCard />
      <AlumniCard slugId={slugId} />
    </div>
  );
}
