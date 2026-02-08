export type OrganizerType = "user" | "college";
export type RSVPStatus = "booked" | "interested" | "not_going";
export type EventStatus = "ACTIVE" | "SUPERSEDED" | "CANCELLED";
export type RsvpSourceType = "DIRECT" | "INHERITED";

export enum EventSilo {
  ACADEMIC = "academic",
  ADMISSION = "admission",
  EXAM = "exam",
  CAREER = "career",
  CULTURAL = "cultural",
  SPORTS = "sports",
  OTHER = "other",
}

export interface RecurrenceDto {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  count?: number;
  until?: string;
}

export interface Event {
  id: string;
  organizerType: OrganizerType;
  organizerUserId?: string;
  organizerCollegeId?: number;
  
  // Populated relations
  organizerUser?: {
    id: string;
    name: string;
    image: string | null;
  };
  organizerCollege?: {
    college_id: number;
    college_name: string;
    logo_img: string | null;
  };

  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  location?: string;
  mediaUrl?: string;
  durationInMins?: number;
  rsvpCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  // New fields
  recurring: boolean;
  capacity?: number;
  silo: EventSilo;
  recurrenceId?: string;
  recurrence?: RecurrenceDto;
  status: EventStatus;

  // Custom field populated for current user
  userRsvpStatus?: RSVPStatus;
}

export interface CreateEventDto {
  organizerType: OrganizerType;
  organizerUserId?: string;
  organizerCollegeId?: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  mediaUrl?: string;
  durationInMins?: number;
  
  recurring?: boolean;
  capacity?: number;
  silo?: EventSilo;
  recurrence?: RecurrenceDto;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  mediaUrl?: string;
  durationInMins?: number;
  
  recurring?: boolean;
  capacity?: number;
  silo?: EventSilo;
  
  applyToSeries?: "SINGLE" | "FUTURE" | "ALL";
  copyAttendeesToFuture?: boolean;
  recurrence?: RecurrenceDto;
}

export interface CreateRsvpDto {
  eventId: string;
  status: RSVPStatus;
}

export interface UpdateRsvpDto {
  status: RSVPStatus;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: RSVPStatus;
  sourceType: RsvpSourceType;
  sourceEventId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface EventQueryDto {
  page?: number;
  limit?: number;
  organizerType?: OrganizerType;
  organizerUserId?: string;
  organizerCollegeId?: number;
  startAfter?: string;
  startBefore?: string;
  endAfter?: string;
  endBefore?: string;
  // TODO: Add support for this in backend
  rsvpUserId?: string;
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RsvpsResponse {
  data: EventRsvp[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
