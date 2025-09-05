"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import ProfilePage from "@/components/profile/ProfilePage";
import { CurveBottom, CurveTop } from "@/components/profile/Activetabsvgs";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { LogOut, User, GraduationCap, Briefcase, Activity } from "lucide-react";

const tabs = [
  { id: "basic-details", label: "Basic Details", icon: User },
  { id: "education-details", label: "Education details", icon: GraduationCap },
  { id: "work-experience", label: "Work Experience", icon: Briefcase },
  { id: "engagement-activity", label: "Engagement activity", icon: Activity },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("basic-details");
  const isMobile = useIsMobile();
  const { logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <SidebarProvider className="bg-[#dfebfb]">
      <Sidebar className="bg-[#4A4A6A] text-white overflow-visible">
        <SidebarHeader className="p-4">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
        </SidebarHeader>
        <SidebarContent className="pl-4 overflow-visible flex flex-col justify-between h-full">
          <SidebarMenu>
            {tabs.map((tab) => (
              <SidebarMenuItem
                key={tab.id}
                className={`relative p-4 cursor-pointer rounded-l-full text-base z-10 ${
                  activeTab === tab.id
                    ? "bg-[#DFEBFB] text-black font-semibold"
                    : "hover:text-gray-6 text-white font-semibold"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {activeTab === tab.id && !isMobile && (
                  <>
                    <CurveTop sidebar="#DFEBFB" tab="#00A76F" />
                    <CurveBottom sidebar="#DFEBFB" tab="#00A76F" />
                  </>
                )}
                <div className="flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="mt-auto">
            <SidebarMenuItem
              className="relative p-4 cursor-pointer rounded-l-full text-base z-10 hover:text-gray-6 text-white font-semibold flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </SidebarMenuItem>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="container px-2 sm:px-6 md:px-10 lg:px-20 bg-[#dfebfb] mx-auto bg-transparent">
        <header className="bg-white flex justify-evenly h-16 shrink-0 items-center gap-2 border-b px-4 py-4 rounded-b-2xl shadow">
          <SidebarTrigger className="-ml-1 text-gray-800/80 hover:text-black " />
          <Link
            href={"/"}
            className="text-primary-main text-2xl text-center font-bold mx-auto"
          >
            True<span className="text-gray-8">Scholar</span>
          </Link>
        </header>
        <div className="flex flex-1 flex-col gap-4 py-10 ">
          <ProfilePage activeTab={activeTab} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
