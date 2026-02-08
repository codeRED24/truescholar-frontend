"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createRsvp,
  updateRsvp,
  deleteRsvp,
  getEventRsvps,
  getMyRsvp,
} from "../api/events-api";
import {
  type EventQueryDto,
  type CreateEventDto,
  type UpdateEventDto,
  type CreateRsvpDto,
  type UpdateRsvpDto,
  type RSVPStatus,
  isApiError,
  Event,
} from "../types";
import { toast } from "sonner";

// ============================================================================
// Query Keys
// ============================================================================

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params?: EventQueryDto) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  rsvps: (eventId: string) => [...eventKeys.all, "rsvps", eventId] as const,
  myRsvp: (eventId: string) => [...eventKeys.all, "my-rsvp", eventId] as const,
};

// ============================================================================
// Queries
// ============================================================================

export function useEvents(params: EventQueryDto = {}) {
  // Use pagination via page number for now since backend supports it, 
  // but infinite query usually expects cursor.
  // Backend getEvents returns `nextCursor` if it uses cursor-based pagination, 
  // but the current implementation uses `page` and `limit`.
  // Wait, I saw `getEvents` in backend uses `skip/take` with `page`.
  // But standard infinite query pattern uses pages.
  
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const result = await getEvents(params);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
  });
}

// For infinite scroll support if we need it later
export function useInfiniteEvents(params: Omit<EventQueryDto, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: eventKeys.list(params),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getEvents({ ...params, page: pageParam as number });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const result = await getEventById(id);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useMyRsvp(eventId: string) {
  return useQuery({
    queryKey: eventKeys.myRsvp(eventId),
    queryFn: async () => {
      const result = await getMyRsvp(eventId);
      if (isApiError(result)) throw new Error(result.error);
      // Backend returns null if no RSVP, or 204 No Content
      return result.data;
    },
    enabled: !!eventId,
    retry: false,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventDto) => {
      const result = await createEvent(data);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success("Event created successfully!");
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEventDto) => {
      const result = await updateEvent(id, data);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(eventKeys.detail(id), updatedEvent);
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success("Event updated successfully!");
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEvent(id);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success("Event deleted");
    },
  });
}

// RSVP Mutation handling create, update, delete automatically
export function useRsvp(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ status, currentRsvpId }: { status: RSVPStatus | null, currentRsvpId?: string }) => {
      if (!status) {
        // Delete RSVP
        if (currentRsvpId) {
          const result = await deleteRsvp(currentRsvpId);
          if (isApiError(result)) throw new Error(result.error);
          return null;
        }
        return null;
      }
      
      if (currentRsvpId) {
        // Update existing
        const result = await updateRsvp(currentRsvpId, { status });
        if (isApiError(result)) throw new Error(result.error);
        return result.data;
      } else {
        // Create new
        const result = await createRsvp({ eventId, status });
        if (isApiError(result)) throw new Error(result.error);
        return result.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.myRsvp(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      // Also invalidate lists because RSVP count might change (though rarely shown in lists)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
