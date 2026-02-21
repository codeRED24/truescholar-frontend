import { ProfileRecentActivityPage } from "@/features/social/components/profile-page/ProfileRecentActivityPage";

interface ProfileRecentActivityCommentsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfileRecentActivityCommentsPage({
  params,
}: ProfileRecentActivityCommentsPageProps) {
  const { userId: profileHandle } = await params;

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-black">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <ProfileRecentActivityPage
          profileHandle={profileHandle}
          initialTab="comments"
        />
      </div>
    </div>
  );
}
