import { format } from "date-fns";
import { type Event } from "../types";

export type EventTimeStatus = "future" | "live" | "past";

export function getEventStatus(event: Event): EventTimeStatus {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (now > end) return "past";
  if (now >= start && now <= end) return "live";
  return "future";
}

export function getRsvpButtonText(
  isRsvped: boolean,
  status: EventTimeStatus
): string {
  if (status === "past") return "Attended";
  if (isRsvped) {
    return status === "live" ? "Attending" : "Registered";
  }
  return status === "live" ? "Attend" : "Register";
}

export function formatEventDate(dateString: string, formatStr = "EEE, MMM d, h:mm a"): string {
  return format(new Date(dateString), formatStr);
}

export function getOrganizerInfo(event: Event) {
  const isCollege = event.organizerType === "college";
  const name = isCollege
    ? event.organizerCollege?.college_name
    : event.organizerUser?.name;
  const image = isCollege
    ? event.organizerCollege?.logo_img
    : event.organizerUser?.image;
  const type = isCollege ? "College" : "User";

  return { 
    name: name || type, 
    image, 
    type,
    id: isCollege ? event.organizerCollegeId : event.organizerUserId
  };
}
