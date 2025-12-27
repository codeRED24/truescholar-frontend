"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Calendar, MapPin } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    phoneNumber?: string | null;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.3),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-xl opacity-50 scale-110" />
            <Avatar className="relative h-28 w-28 md:h-36 md:w-36 border-4 border-white/20 shadow-2xl ring-4 ring-white/10">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="text-3xl md:text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              {user.name}
            </h1>
            <p className="text-blue-200/80 mb-4">Welcome to your profile</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90">
                <Mail className="h-4 w-4 text-blue-300" />
                <span>{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90">
                  <Phone className="h-4 w-4 text-green-300" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}
