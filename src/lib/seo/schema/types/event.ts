/**
 * Event Schema Builder
 * Generates Event structured data for college dates and exam events
 */

import { siteConfig } from "../../config";

export interface EventSchemaInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_confirmed?: boolean;
  location?: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
  };
  organizer?: {
    name: string;
    url?: string;
  };
  event_type?: "admission" | "exam" | "result" | "counseling" | "general";
  url?: string;
  image?: string;
}

export interface EventSchema {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  eventStatus: string;
  eventAttendanceMode: string;
  location?: {
    "@type": "Place" | "VirtualLocation";
    name: string;
    address?: {
      "@type": "PostalAddress";
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      addressCountry: string;
    };
  };
  organizer?: {
    "@type": "Organization";
    name: string;
    url?: string;
  };
  image?: string;
  url?: string;
}

/**
 * Build Event schema
 */
export function buildEventSchema(input: EventSchemaInput): EventSchema {
  const schema: EventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    eventStatus: input.is_confirmed
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventPostponed",
    eventAttendanceMode: getAttendanceMode(input.event_type),
  };

  if (input.description) {
    schema.description = input.description;
  }

  if (input.start_date) {
    schema.startDate = input.start_date;
  }

  if (input.end_date) {
    schema.endDate = input.end_date;
  }

  // Location
  if (input.location) {
    schema.location = {
      "@type": "Place",
      name: input.location.name,
    };

    if (input.location.address || input.location.city || input.location.state) {
      schema.location.address = {
        "@type": "PostalAddress",
        addressCountry: "IN",
      };

      if (input.location.address) {
        schema.location.address.streetAddress = input.location.address;
      }
      if (input.location.city) {
        schema.location.address.addressLocality = input.location.city;
      }
      if (input.location.state) {
        schema.location.address.addressRegion = input.location.state;
      }
    }
  } else if (isOnlineEvent(input.event_type)) {
    schema.location = {
      "@type": "VirtualLocation",
      name: "Online",
    };
  }

  // Organizer
  if (input.organizer) {
    schema.organizer = {
      "@type": "Organization",
      name: input.organizer.name,
      url: input.organizer.url || siteConfig.baseUrl,
    };
  }

  if (input.image) {
    schema.image = input.image;
  }

  if (input.url) {
    schema.url = input.url;
  }

  return schema;
}

/**
 * Build multiple Event schemas from college dates
 */
export function buildCollegeDatesSchemas(
  collegeName: string,
  dates: Array<{
    event: string;
    start_date?: string;
    end_date?: string;
    is_confirmed?: boolean;
  }>,
  collegeUrl: string
): EventSchema[] {
  return dates
    .filter((date) => date.start_date || date.end_date)
    .map((date) =>
      buildEventSchema({
        name: `${collegeName} - ${date.event}`,
        description: `${date.event} at ${collegeName}`,
        start_date: date.start_date,
        end_date: date.end_date,
        is_confirmed: date.is_confirmed,
        organizer: {
          name: collegeName,
          url: collegeUrl,
        },
        event_type: detectEventType(date.event),
        url: collegeUrl,
      })
    );
}

/**
 * Determine attendance mode based on event type
 */
function getAttendanceMode(eventType?: string): string {
  switch (eventType) {
    case "exam":
      return "https://schema.org/MixedEventAttendanceMode";
    case "result":
    case "counseling":
      return "https://schema.org/OnlineEventAttendanceMode";
    default:
      return "https://schema.org/OfflineEventAttendanceMode";
  }
}

/**
 * Check if event is online
 */
function isOnlineEvent(eventType?: string): boolean {
  return eventType === "result" || eventType === "counseling";
}

/**
 * Detect event type from event name
 */
function detectEventType(
  eventName: string
): "admission" | "exam" | "result" | "counseling" | "general" {
  const name = eventName.toLowerCase();

  if (name.includes("admission") || name.includes("application")) {
    return "admission";
  }
  if (name.includes("exam") || name.includes("test")) {
    return "exam";
  }
  if (name.includes("result") || name.includes("declaration")) {
    return "result";
  }
  if (name.includes("counseling") || name.includes("counselling")) {
    return "counseling";
  }

  return "general";
}
