"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  Home,
  Menu,
  MessageSquare,
  Search,
  Users,
  X,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

import { useNotificationStore } from "@/features/social/stores/notification-store";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  count?: number;
}

export function FeedHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession(); // Assuming auth hook
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems: NavItem[] = [
    { label: "Home", icon: Home, href: "/feed" },
    { label: "Network", icon: Users, href: "/feed/network" },
    { label: "Jobs", icon: Briefcase, href: "/feed/jobs" },
    { label: "Messaging", icon: MessageSquare, href: "/feed/messaging" },
    { 
      label: "Notifications", 
      icon: Bell, 
      href: "/feed/notifications",
      count: unreadCount 
    },
  ];

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b h-16">
      <div className="container mx-auto h-full px-4 max-w-7xl flex items-center justify-between">
        {/* Logo and Search */}
        <div className="flex items-center gap-4">
          <Link href="/feed" className="flex-shrink-0">
            <div className="text-xl font-extrabold text-primary-main">
              True<span className="text-gray-8">Scholar</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div
            className={cn(
              "hidden md:block relative transition-all duration-300 ease-in-out",
              isSearchFocused ? "w-96 lg:w-[32rem]" : "w-64 lg:w-80"
            )}
          >
            <InputGroup className="rounded-full">
              <InputGroupInput
                className="!rounded-none !border-0 !bg-transparent !shadow-none !outline-none focus:!outline-none focus:!ring-0 focus:!border-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!border-0 dark:!bg-transparent"
                placeholder="Search..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-6">
          <ul className="flex items-center gap-2 lg:gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label} className="relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 pt-4 min-w-[3.5rem] rounded-md transition-colors hover:text-foreground/80",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <div className="relative">
                      <item.icon
                        className={cn("h-6 w-6", isActive && "fill-current")}
                      />
                      {!!item.count && item.count > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white animate-in zoom-in border-2 border-background box-content">
                          {item.count > 99 ? "99+" : item.count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-medium hidden lg:block">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="w-px h-8 bg-border mx-2" />

          {/* Theme Toggler and Profile */}
          <div className="flex items-center gap-2">
            <AnimatedThemeToggler className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session?.user?.image || ""}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <AnimatedThemeToggler className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors" />
          <Button variant="ghost" size="icon" onClick={toggleSearch}>
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-b bg-background px-4 py-3 animate-in fade-in slide-in-from-top-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-full"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b animate-in fade-in slide-in-from-top-2 absolute w-full shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <div className="flex items-center gap-3 p-2 mb-2 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {session?.user?.name || "Guest"}
                </span>
                <Link
                  href="/profile"
                  className="text-xs text-primary hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {!!item.count && item.count > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              <button className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive">
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
