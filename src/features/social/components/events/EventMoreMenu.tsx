"use client";

import { MoreHorizontal, Edit, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { useDeleteEvent } from "../../hooks/use-events";
import { useRouter } from "next/navigation";

interface EventMoreMenuProps {
  eventId: string;
  isOwner: boolean;
}

export function EventMoreMenu({ eventId, isOwner }: EventMoreMenuProps) {
  const router = useRouter();
  const deleteMutation = useDeleteEvent();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteMutation.mutate(eventId, {
        onSuccess: () => {
          toast.success("Event deleted");
          router.push("/feed/events");
        },
        onError: () => toast.error("Failed to delete event"),
      });
    }
  };

  const handleReport = () => {
    toast.info("Report submitted", { description: "Thank you for helping keep our community safe." });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isOwner ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/feed/events/${eventId}/edit`} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleReport} className="cursor-pointer">
            <Flag className="mr-2 h-4 w-4" />
            Report Event
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
