"use client";

import { NotificationList } from "@/features/social/components/notifications/NotificationList";
import { SidebarProfile, StatsCard, SidebarNavigation, RightSidebar } from "@/features/social";
import { useSession } from "@/lib/auth-client";
import { MobileProfileCard } from "@/features/social"; // Assuming this is exported from index

export default function NotificationsPage() {
  const { data: session } = useSession();
  
  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "User",
        image: session.user.image ?? undefined,
        handle: "username",
        headline: "Student",
      }
    : undefined;

  const mockStats = {
    posts: 42,
    followers: 856,
    following: 124,
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            {currentUser && (
              <SidebarProfile user={currentUser} stats={mockStats} />
            )}
            <StatsCard stats={mockStats} />
            <SidebarNavigation />
          </div>
        </div>

        {/* Center Content */}
        <div className="col-span-1 md:col-span-9 lg:col-span-6">
            {currentUser && (
               <div className="md:hidden mb-4">
                 <MobileProfileCard user={currentUser} />
               </div>
            )}
          <NotificationList />
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
