import {
  Calendar,
  Users,
  Hash,
  Bookmark,
  Settings,
  HelpCircle,
  Newspaper,
  BookOpen,
} from "lucide-react";

export const SIDEBAR_NAVIGATION_ITEMS = [
  {
    title: "",
    items: [
      { label: "Saved items", icon: Bookmark, href: "/feed/saved" },
      { label: "Groups", icon: Users, href: "/feed/groups" },
      { label: "Newsletters", icon: Newspaper, href: "/feed/newsletters" },
      { label: "Events", icon: Calendar, href: "/feed/events" },
    ],
  },
];

export const RIGHT_SIDEBAR_NEWS = [
  {
    id: "1",
    title: "Top Universities Announced for 2024",
    time: "2h ago",
    readers: "10k readers",
    img: "https://placehold.co/200x200/e2e8f0/1e293b?text=News",
  },
  {
    id: "2",
    title: "New Scholarship Programs",
    time: "4h ago",
    readers: "5k readers",
    img: "https://placehold.co/200x200/e2e8f0/1e293b?text=Grant",
  },
  {
    id: "3",
    title: "Campus Life: Balancing Study",
    time: "1d ago",
    readers: "2k readers",
    img: "https://placehold.co/200x200/e2e8f0/1e293b?text=Life",
  },
];

export const RIGHT_SIDEBAR_COURSES = [
  {
    id: "101",
    title: "Introduction to Computer Science",
    university: "Harvard University",
    students: "1.2M students",
    img: "https://placehold.co/200x200/e2e8f0/1e293b?text=CS50",
  },
  {
    id: "102",
    title: "Data Science Specialization",
    university: "Johns Hopkins University",
    students: "500k students",
    img: "https://placehold.co/200x200/e2e8f0/1e293b?text=Data",
  },
];
