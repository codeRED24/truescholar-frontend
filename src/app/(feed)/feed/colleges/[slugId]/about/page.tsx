"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollegeAbout } from "@/features/social/hooks/use-college-profile";
import { Loader2, Users, GraduationCap, Building2, Award } from "lucide-react";

export default function CollegeAboutPage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugId = params.slugId;
  const { data: about, isLoading } = useCollegeAbout(slugId);

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />;
  }

  if (!about) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Users className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">
              {about.stats.totalStudents?.toLocaleString() || "-"}
            </p>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Building2 className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">
              {about.stats.campusSize?.toLocaleString() || "-"}
            </p>
            <p className="text-xs text-muted-foreground">Acres Campus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <GraduationCap className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{about.stats.foundedYear || "-"}</p>
            <p className="text-xs text-muted-foreground">Founded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Award className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{about.stats.naccGrade || "-"}</p>
            <p className="text-xs text-muted-foreground">NAAC Grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: about.overview || "No description available." }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
