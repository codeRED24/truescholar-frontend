"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function EventsTabs({ activeTab, onTabChange }: EventsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="my-events">My Events</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
