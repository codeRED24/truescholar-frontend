import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Bell, MessageCircle, Heart, UserPlus, Briefcase } from "lucide-react";

interface NotificationItemProps {
  notification: any;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case "post_liked":
    case "comment_liked":
      return <Heart className="h-4 w-4 text-red-500" fill="currentColor" />;
    case "post_commented":
    case "comment_replied":
      return <MessageCircle className="h-4 w-4 text-blue-500" fill="currentColor" />;
    case "new_follower":
    case "connection_accepted":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "job_application_received":
    case "application_status_changed":
      return <Briefcase className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDelete,
}) => {
  const isRead = notification.isRead;
  const link = notification.link || "#";

  return (
    <div
      className={cn(
        "relative flex gap-4 p-4 border-b hover:bg-muted/50 transition-colors group",
        !isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
      onClick={() => !isRead && onRead(notification.id)}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={notification.actor?.image || ""}
            alt={notification.actor?.name || "User"}
          />
          <AvatarFallback>
            {notification.actor?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border shadow-sm">
          {getIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <Link href={link} className="block group-hover:underline-offset-2">
          <p className="text-sm font-medium leading-none">
            <span className="font-bold hover:underline">
              {notification.actor?.name}
            </span>{" "}
            <span className="font-normal text-muted-foreground">
              {notification.message}
            </span>
          </p>
          {notification.title && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {notification.title}
            </p>
          )}
        </Link>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {!isRead && (
        <div className="shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        </div>
      )}
      
      {/* Optional delete button could go here, shown on hover */}
    </div>
  );
};
