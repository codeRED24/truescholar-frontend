"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Loader2, 
  Trash2, 
  Users, 
  Search,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEventRsvps } from "../../hooks/use-events";
import { toast } from "sonner";

interface EventAttendeeListProps {
  eventId: string;
}

export function EventAttendeeList({ eventId }: EventAttendeeListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useEventRsvps(eventId, page);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRemoveAttendee = (rsvpId: string) => {
    // Ideally this would hook into a mutation like `useDeleteRsvpAsOrganizer`
    // For now, we'll placeholder it as the backend endpoint might just be for self-delete
    toast.info("Remove functionality coming soon", {
      description: "Organizers will be able to remove attendees shortly."
    });
  };

  if (isError) {
    return (
      <div className="p-4 border rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Failed to load attendee list.
      </div>
    );
  }

  const attendees = data?.data || [];
  const totalPages = data?.meta.totalPages || 1;

  // Client-side filtering for now until backend supports search
  const filteredAttendees = attendees.filter(rsvp => 
    rsvp.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="mt-8 border-none shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Manage Attendees
            </CardTitle>
            <CardDescription>
              View and manage the guest list for your event.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search attendees..."
              className="pl-9 h-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-background/50">
            <Users className="h-10 w-10 mb-3 opacity-20" />
            <p>No attendees found.</p>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RSVP Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.map((rsvp) => (
                  <TableRow key={rsvp.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border shadow-sm">
                          <AvatarImage src={rsvp.user?.image || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {rsvp.user?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm leading-none">{rsvp.user?.name}</span>
                          <span className="text-xs text-muted-foreground mt-1">Guest</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none">
                        Confirmed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(rsvp.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttendee(rsvp.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove attendee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-muted/5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
