import {
  type ApiResponse,
  type Event,
  type EventsResponse,
  type EventRsvp,
  type CreateEventDto,
  type UpdateEventDto,
  type CreateRsvpDto,
  type UpdateRsvpDto,
  type EventQueryDto,
  type RsvpsResponse
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error:
          errorData.message || `Request failed with status ${response.status}`,
        statusCode: response.status,
      };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================================================
// Events CRUD
// ============================================================================

export async function getEvents(
  params: EventQueryDto,
): Promise<ApiResponse<EventsResponse>> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.organizerType) queryParams.set("organizerType", params.organizerType);
  if (params.organizerUserId) queryParams.set("organizerUserId", params.organizerUserId);
  if (params.organizerCollegeId) queryParams.set("organizerCollegeId", String(params.organizerCollegeId));
  if (params.startAfter) queryParams.set("startAfter", params.startAfter);
  if (params.startBefore) queryParams.set("startBefore", params.startBefore);
  if (params.endAfter) queryParams.set("endAfter", params.endAfter);
  if (params.endBefore) queryParams.set("endBefore", params.endBefore);
  if (params.rsvpUserId) queryParams.set("rsvpUserId", params.rsvpUserId);

  const queryString = queryParams.toString();
  return fetchApi<EventsResponse>(`/events${queryString ? `?${queryString}` : ""}`);
}

export async function getEventById(id: string): Promise<ApiResponse<Event>> {
  return fetchApi<Event>(`/events/${id}`);
}

export async function createEvent(
  data: CreateEventDto,
): Promise<ApiResponse<Event>> {
  return fetchApi<Event>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEvent(
  id: string,
  data: UpdateEventDto,
): Promise<ApiResponse<Event>> {
  return fetchApi<Event>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/events/${id}`, {
    method: "DELETE",
  });
}

// ============================================================================
// RSVP
// ============================================================================

export async function createRsvp(
  data: CreateRsvpDto,
): Promise<ApiResponse<EventRsvp>> {
  return fetchApi<EventRsvp>("/events/rsvp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRsvp(
  id: string,
  data: UpdateRsvpDto,
): Promise<ApiResponse<EventRsvp>> {
  return fetchApi<EventRsvp>(`/events/rsvp/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRsvp(id: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/events/rsvp/${id}`, {
    method: "DELETE",
  });
}

export async function getEventRsvps(
  eventId: string,
  params?: { page?: number; limit?: number },
): Promise<ApiResponse<RsvpsResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));

  const queryString = queryParams.toString();
  return fetchApi<RsvpsResponse>(`/events/${eventId}/rsvps${queryString ? `?${queryString}` : ""}`);
}

export async function getMyRsvp(eventId: string): Promise<ApiResponse<EventRsvp | null>> {
  return fetchApi<EventRsvp | null>(`/events/${eventId}/my-rsvp`);
}
