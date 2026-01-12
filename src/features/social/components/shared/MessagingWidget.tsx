"use client";

import { useState } from "react";
import {
  MessageCircle,
  X,
  ChevronUp,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MessagingWidgetProps {
  className?: string;
}

const MOCK_MESSAGES = [
  {
    id: 1,
    user: {
      name: "Alice Smith",
      image: "https://placehold.co/100x100/e2e8f0/1e293b?text=AS",
    },
    lastMessage: "Hey, did you see the new course?",
    time: "5m",
    unread: true,
  },
  {
    id: 2,
    user: {
      name: "Bob Johnson",
      image: "https://placehold.co/100x100/e2e8f0/1e293b?text=BJ",
    },
    lastMessage: "Thanks for the notes!",
    time: "1h",
    unread: false,
  },
  {
    id: 3,
    user: {
      name: "Carol White",
      image: "https://placehold.co/100x100/e2e8f0/1e293b?text=CW",
    },
    lastMessage: "Meeting at 3 PM?",
    time: "2h",
    unread: false,
  },
  {
    id: 4,
    user: {
      name: "David Brown",
      image: "https://placehold.co/100x100/e2e8f0/1e293b?text=DB",
    },
    lastMessage: "Let's connect soon.",
    time: "1d",
    unread: false,
  },
];

export function MessagingWidget({ className }: MessagingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-auto rounded-full shadow-lg gap-2 px-4"
        >
          <Avatar className="h-6 w-6 border border-primary-foreground/20">
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-[10px]">
              ME
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">Messaging</span>
          <ChevronUp className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-0 right-4 w-80 h-[450px] flex flex-col shadow-xl z-50 rounded-t-xl rounded-b-none",
        className
      )}
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-card rounded-t-xl">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">Messaging</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages"
            className="pl-9 h-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-2">
        {MOCK_MESSAGES.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={msg.user.image} />
              <AvatarFallback>
                {msg.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={cn(
                    "text-sm font-medium",
                    msg.unread && "font-bold"
                  )}
                >
                  {msg.user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {msg.time}
                </span>
              </div>
              <p
                className={cn(
                  "text-xs text-muted-foreground truncate",
                  msg.unread && "text-foreground font-medium"
                )}
              >
                {msg.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
