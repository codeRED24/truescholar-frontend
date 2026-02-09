"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  X,
  MapPin,
  ImageIcon,
  Users,
  Repeat,
  Calendar as CalendarIcon,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateEvent, useUpdateEvent } from "../../hooks/use-events";
import { useCollegeMemberships } from "../../hooks/use-memberships";
import { uploadPostMedia } from "../../api/social-api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { type OrganizerType, type Event, EventSilo } from "../../types";
import { cn } from "@/lib/utils";

const recurrenceSchema = z
  .object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    interval: z.coerce.number().min(1).default(1),
    count: z.coerce.number().min(1).optional(),
    until: z.string().optional(),
  })
  .refine((data) => data.count || data.until, {
    message: "Either number of occurrences or end date is required",
    path: ["until"],
  });

// Base schema definition for consistent typing
const baseEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  organizerType: z.enum(["user", "college"]),
  organizerCollegeId: z.string().optional(),
  silo: z.nativeEnum(EventSilo, { message: "Please select a category" }),
  capacity: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.number().min(1).optional(),
  ),
  recurring: z.boolean().default(false),
  recurrence: recurrenceSchema.optional(),
});

type EventFormData = z.infer<typeof baseEventSchema>;

const getEventSchema = (mode: "create" | "edit") => {
  // Base refinement for recurrence
  const withRecurrence = baseEventSchema.refine(
    (data) => {
      if (data.recurring && !data.recurrence) return false;
      return true;
    },
    {
      message: "Recurrence details are required for recurring events",
      path: ["recurrence"],
    },
  );

  if (mode === "create") {
    return withRecurrence
      .and(
        z.object({
          startTime: z.string().refine((val) => new Date(val) > new Date(), {
            message: "Start time must be in the future",
          }),
        }),
      )
      .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
        message: "End time must be after start time",
        path: ["endTime"],
      });
  }

  // Edit mode - no future requirement on startTime
  return withRecurrence.refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );
};

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: Event;
  eventId?: string;
}

export function EventForm({ mode, initialData, eventId }: EventFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { data: memberships = [] } = useCollegeMemberships();

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent(eventId || "");

  const isSubmitting =
    createEventMutation.isPending || updateEventMutation.isPending;

  // Filter for admin memberships
  const adminMemberships = memberships.filter(
    (m) =>
      m.role === "college_admin" || m.role === "admin" || m.role === "owner",
  );

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(
    mode === "edit" && initialData?.mediaUrl ? initialData.mediaUrl : null,
  );
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Dialog State for Recurring Updates
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateScope, setUpdateScope] = useState<"SINGLE" | "FUTURE">("SINGLE");
  const [copyAttendees, setCopyAttendees] = useState(false);
  const [pendingData, setPendingData] = useState<EventFormData | null>(null);

  const hasProcessedUrlParam = useRef(false);

  // Helper to update date/time from separate inputs
  const handleDateSelect = (
    field: "startTime" | "endTime",
    date: Date | undefined,
  ) => {
    if (!date) return;
    const currentIso = watch(field);
    const current = currentIso ? new Date(currentIso) : new Date();

    // Set the date part
    current.setFullYear(date.getFullYear());
    current.setMonth(date.getMonth());
    current.setDate(date.getDate());

    setValue(field, current.toISOString());
  };

  const handleTimeChange = (
    field: "startTime" | "endTime",
    timeString: string,
  ) => {
    if (!timeString) return;
    const [hours, minutes] = timeString.split(":").map(Number);
    const currentIso = watch(field);
    const current = currentIso ? new Date(currentIso) : new Date();

    // Set the time part
    current.setHours(hours);
    current.setMinutes(minutes);

    setValue(field, current.toISOString());
  };

  const getDateTimeParts = (isoString?: string) => {
    if (!isoString) return { date: undefined, time: "" };
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return { date: undefined, time: "" };

    return {
      date,
      time: format(date, "HH:mm"),
    };
  };

  const schema = getEventSchema(mode);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<EventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      startTime: initialData?.startTime || new Date().toISOString(),
      endTime:
        initialData?.endTime || new Date(Date.now() + 3600000).toISOString(), // +1 hour
      organizerType: initialData?.organizerType || "user",
      organizerCollegeId: initialData?.organizerCollegeId
        ? String(initialData.organizerCollegeId)
        : undefined,
      silo: initialData?.silo || EventSilo.OTHER,
      capacity: initialData?.capacity || undefined,
      recurring: initialData?.recurring || false,
      recurrence: {
        frequency: initialData?.recurrence?.frequency ?? "WEEKLY",
        interval: initialData?.recurrence?.interval ?? 1,
        count: initialData?.recurrence?.count ?? 10,
        until: initialData?.recurrence?.until ?? undefined,
      },
    },
  });

  const organizerType = watch("organizerType");
  const isRecurring = useWatch({ control, name: "recurring" });

  // Track recurrence end mode (count vs until) - initialize based on initialData
  const [recurrenceEndMode, setRecurrenceEndMode] = useState<"count" | "until">(
    initialData?.recurrence?.until ? "until" : "count",
  );

  // Handle URL param for pre-selecting college (only in create mode)
  useEffect(() => {
    if (mode === "edit") return;

    const collegeIdParam = searchParams.get("collegeId");

    if (
      !collegeIdParam ||
      hasProcessedUrlParam.current ||
      adminMemberships.length === 0
    ) {
      return;
    }

    const targetCollege = adminMemberships.find(
      (m) => String(m.collegeId) === collegeIdParam,
    );

    if (targetCollege) {
      hasProcessedUrlParam.current = true;
      setValue("organizerType", "college");
      setValue("organizerCollegeId", String(targetCollege.collegeId));
    }
  }, [searchParams, adminMemberships, setValue, mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large (max 5MB)");
        return;
      }
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setRemoveExistingMedia(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    if (mediaPreview && mediaPreview !== initialData?.mediaUrl) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    if (mode === "edit" && initialData?.mediaUrl) {
      setRemoveExistingMedia(true);
    }
  };

  const handleFormSubmit = async (data: EventFormData) => {
    // If editing a recurring event, ask for scope
    if (mode === "edit" && initialData?.recurring) {
      setPendingData(data);
      setUpdateDialogOpen(true);
      return;
    }
    await processSubmit(data);
  };

  const processSubmit = async (
    data: EventFormData,
    scope: "SINGLE" | "FUTURE" = "SINGLE",
    shouldCopyAttendees: boolean = false,
  ) => {
    try {
      if (
        mode === "create" &&
        data.organizerType === "college" &&
        !data.organizerCollegeId
      ) {
        toast.error("Please select a college");
        return;
      }

      let mediaUrl = mode === "edit" ? initialData?.mediaUrl : undefined;

      if (mediaFile) {
        setIsUploading(true);
        try {
          const response = await uploadPostMedia(mediaFile);
          if ("error" in response) throw new Error(response.error);
          mediaUrl = response.data.url;
        } catch {
          toast.error("Failed to upload image");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      } else if (removeExistingMedia) {
        mediaUrl = undefined;
      }

      // Prepare payload
      const payload: any = {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        location: data.location,
        mediaUrl,
        silo: data.silo,
        capacity: data.capacity,
        recurring: data.recurring,
      };

      if (data.recurring && data.recurrence) {
        payload.recurrence = {
          frequency: data.recurrence.frequency,
          interval: data.recurrence.interval,
          count:
            recurrenceEndMode === "count" ? data.recurrence.count : undefined,
          until:
            recurrenceEndMode === "until" && data.recurrence.until
              ? new Date(data.recurrence.until).toISOString()
              : undefined,
        };
      }

      // Add update scope if editing
      if (mode === "edit") {
        payload.applyToSeries = scope;
        // Only include copyAttendeesToFuture if applying to future events
        if (scope === "FUTURE") {
          payload.copyAttendeesToFuture = shouldCopyAttendees;
        }
      }

      if (mode === "create") {
        await createEventMutation.mutateAsync({
          ...payload,
          organizerType: data.organizerType as OrganizerType,
          organizerUserId:
            data.organizerType === "user" ? session?.user.id : undefined,
          organizerCollegeId:
            data.organizerType === "college" && data.organizerCollegeId
              ? parseInt(data.organizerCollegeId)
              : undefined,
        });
        router.push("/feed/events");
      } else {
        if (!eventId) return;
        await updateEventMutation.mutateAsync(payload);
        router.push(`/feed/events/${eventId}`);
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleUpdateConfirm = () => {
    if (pendingData) {
      processSubmit(pendingData, updateScope, copyAttendees);
      setUpdateDialogOpen(false);
      setCopyAttendees(false); // Reset for next time
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-8 animate-in fade-in duration-500"
      >
        {mode === "edit" && initialData?.recurring && (
          <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center gap-2 border border-blue-100 dark:border-blue-900 shadow-sm">
            <Repeat className="h-4 w-4" />
            <span className="text-sm font-medium">
              This is a recurring event.
            </span>
          </div>
        )}

        {/* SECTION 1: COVER MEDIA */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Cover Image</Label>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Optional
            </span>
          </div>

          {mediaPreview ? (
            <div className="relative group aspect-video w-full rounded-xl overflow-hidden border bg-muted shadow-sm ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2">
              <img
                src={mediaPreview}
                alt="Preview"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-full shadow-lg"
                  onClick={removeMedia}
                >
                  <X className="h-4 w-4 mr-2" /> Remove Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center bg-muted/5 transition-all duration-300 group-hover:bg-muted/10 group-hover:border-primary/50 group-hover:shadow-sm">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="bg-background p-4 rounded-full shadow-sm ring-1 ring-border group-hover:ring-primary/20 group-hover:text-primary transition-all">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {mode === "edit"
                        ? "Click to replace cover image"
                        : "Click or drag to upload cover image"}
                    </p>
                    <p className="text-sm mt-1">
                      Recommended: 16:9 ratio, max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: BASIC DETAILS */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Event Details</CardTitle>
            <CardDescription>
              Tell people what your event is about.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g. Annual Tech Symposium"
                className="h-12 text-lg font-medium"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="silo">Category</Label>
                <Select
                  value={watch("silo")}
                  onValueChange={(val) => setValue("silo", val as EventSilo)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventSilo.ACADEMIC}>Academic</SelectItem>
                    <SelectItem value={EventSilo.ADMISSION}>
                      Admission
                    </SelectItem>
                    <SelectItem value={EventSilo.EXAM}>Exam</SelectItem>
                    <SelectItem value={EventSilo.CAREER}>Career</SelectItem>
                    <SelectItem value={EventSilo.CULTURAL}>Cultural</SelectItem>
                    <SelectItem value={EventSilo.SPORTS}>Sports</SelectItem>
                    <SelectItem value={EventSilo.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.silo && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.silo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">
                  Capacity{" "}
                  <span className="text-muted-foreground font-normal ml-1">
                    (Optional)
                  </span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    className="pl-9 h-10"
                    placeholder="Unlimited"
                    {...register("capacity")}
                  />
                </div>
                {errors.capacity && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.capacity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell people what your event is about..."
                className="min-h-[150px] resize-y p-4 leading-relaxed"
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: LOGISTICS */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Date & Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !watch("startTime") && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("startTime") ? (
                          format(new Date(watch("startTime")), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={getDateTimeParts(watch("startTime")).date}
                        onSelect={(date) => handleDateSelect("startTime", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="relative w-[140px]">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      className="pl-9 h-10"
                      value={getDateTimeParts(watch("startTime")).time}
                      onChange={(e) =>
                        handleTimeChange("startTime", e.target.value)
                      }
                    />
                  </div>
                </div>
                {errors.startTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !watch("endTime") && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch("endTime") ? (
                          format(new Date(watch("endTime")), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={getDateTimeParts(watch("endTime")).date}
                        onSelect={(date) => handleDateSelect("endTime", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="relative w-[140px]">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      className="pl-9 h-10"
                      value={getDateTimeParts(watch("endTime")).time}
                      onChange={(e) =>
                        handleTimeChange("endTime", e.target.value)
                      }
                    />
                  </div>
                </div>
                {errors.endTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="location" className="mt-4 block">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-9 h-10"
                  placeholder="e.g. Main Auditorium or Online link"
                  {...register("location")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: RECURRENCE */}
        <Card
          className={cn(
            "border transition-all duration-300",
            isRecurring
              ? "bg-card shadow-sm"
              : "bg-muted/10 border-dashed hover:bg-muted/20",
          )}
        >
          <CardHeader
            className={cn(
              "pb-4 transition-colors",
              isRecurring ? "bg-muted/30 border-b" : "bg-transparent",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isRecurring ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <CardTitle className="text-lg">Repeating Event</CardTitle>
              </div>
              <Switch
                id="recurring-switch"
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("recurring", checked)}
              />
            </div>
            <CardDescription className="ml-7">
              Create multiple instances automatically
            </CardDescription>
          </CardHeader>

          {isRecurring && (
            <CardContent className="p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={watch("recurrence.frequency")}
                    onValueChange={(val: any) =>
                      setValue("recurrence.frequency", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Repeat Every</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      className="w-24"
                      {...register("recurrence.interval")}
                    />
                    <span className="text-sm font-medium whitespace-nowrap bg-muted px-3 py-2 rounded-md border text-muted-foreground min-w-[80px] text-center">
                      {watch("recurrence.frequency") === "DAILY"
                        ? "Day(s)"
                        : watch("recurrence.frequency") === "WEEKLY"
                          ? "Week(s)"
                          : watch("recurrence.frequency") === "MONTHLY"
                            ? "Month(s)"
                            : "Year(s)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Ends</Label>
                <RadioGroup
                  value={recurrenceEndMode}
                  onValueChange={(val: "count" | "until") =>
                    setRecurrenceEndMode(val)
                  }
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between gap-4 border p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
                      recurrenceEndMode === "count"
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="count" id="end-count" />
                      <Label htmlFor="end-count" className="cursor-pointer">
                        After occurrences
                      </Label>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      className="w-20 h-8 text-center"
                      disabled={recurrenceEndMode !== "count"}
                      {...register("recurrence.count")}
                    />
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between gap-4 border p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
                      recurrenceEndMode === "until"
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="until" id="end-until" />
                      <Label htmlFor="end-until" className="cursor-pointer">
                        On date
                      </Label>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[140px] justify-start text-left font-normal h-8 px-2 text-xs",
                            !watch("recurrence.until") &&
                              "text-muted-foreground",
                          )}
                          disabled={recurrenceEndMode !== "until"}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {watch("recurrence.until") ? (
                            format(new Date(watch("recurrence.until")!), "PP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={
                            watch("recurrence.until")
                              ? new Date(watch("recurrence.until")!)
                              : undefined
                          }
                          onSelect={(date) =>
                            setValue(
                              "recurrence.until",
                              date ? date.toISOString() : undefined,
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </RadioGroup>
                {errors.recurrence?.until && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{" "}
                    {errors.recurrence.until.message}
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* SECTION 5: ORGANIZER */}
        {mode === "create" ? (
          adminMemberships.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-lg">Organize As</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <RadioGroup
                    value={organizerType}
                    onValueChange={(val) =>
                      setValue("organizerType", val as "user" | "college")
                    }
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="user"
                        id="org-user"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="org-user"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent hover:border-accent-foreground/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 w-full h-full"
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-background">
                          <AvatarImage src={session?.user.image || undefined} />
                          <AvatarFallback>
                            {session?.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {session?.user.name} (Me)
                        </div>
                        {organizerType === "user" && (
                          <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                        )}
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem
                        value="college"
                        id="org-college"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="org-college"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent hover:border-accent-foreground/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 w-full h-full"
                      >
                        <div className="bg-primary/10 p-2 rounded-full ring-2 ring-background">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div className="font-medium">My College</div>
                        {organizerType === "college" && (
                          <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                        )}
                      </Label>
                    </div>
                  </RadioGroup>

                  {organizerType === "college" && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-muted/30 p-4 rounded-lg border">
                      <Label
                        htmlFor="college-select"
                        className="mb-2 block font-medium"
                      >
                        Select College
                      </Label>
                      <Select
                        value={watch("organizerCollegeId") || ""}
                        onValueChange={(val) =>
                          setValue("organizerCollegeId", val)
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                        <SelectContent>
                          {adminMemberships.map((m) => (
                            <SelectItem
                              key={m.collegeId}
                              value={String(m.collegeId)}
                            >
                              {m.college.college_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.organizerCollegeId && (
                        <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Please select a
                          college
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          // Edit Mode - Read Only Organizer
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <Label className="mb-2 block text-muted-foreground">
                  Organized By
                </Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        initialData?.organizerType === "college"
                          ? initialData?.organizerCollege?.logo_img || undefined
                          : initialData?.organizerUser?.image || undefined
                      }
                    />
                    <AvatarFallback>
                      {(initialData?.organizerType === "college"
                        ? initialData?.organizerCollege?.college_name
                        : initialData?.organizerUser?.name
                      )?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {initialData?.organizerType === "college"
                      ? initialData?.organizerCollege?.college_name
                      : initialData?.organizerUser?.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border">
                <Info className="h-3 w-3" /> Organizer cannot be changed
              </div>
            </CardContent>
          </Card>
        )}

        {/* ACTIONS */}
        <div className="fixed bottom-6 left-0 right-0 z-50 mx-auto w-full max-w-3xl px-4">
          <Card className="border shadow-xl bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground hidden sm:block font-medium">
                {mode === "create"
                  ? "Ready to publish your event?"
                  : "Make sure to save your changes."}
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[140px]"
                  disabled={isSubmitting || isUploading}
                >
                  {(isSubmitting || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "create" ? "Create Event" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update recurring event</DialogTitle>
            <DialogDescription>
              This is a repeating event. How would you like to apply your
              changes?
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={updateScope}
            onValueChange={(val: any) => setUpdateScope(val)}
            className="py-2"
          >
            <div
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                updateScope === "SINGLE"
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-border",
              )}
            >
              <RadioGroupItem
                value="SINGLE"
                id="scope-single"
                className="mt-1"
              />
              <Label
                htmlFor="scope-single"
                className="cursor-pointer font-normal"
              >
                <span className="font-semibold block mb-0.5">
                  This event only
                </span>
                <span className="text-sm text-muted-foreground">
                  Changes apply only to this specific instance
                </span>
              </Label>
            </div>

            <div
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                updateScope === "FUTURE"
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-border",
              )}
            >
              <RadioGroupItem
                value="FUTURE"
                id="scope-future"
                className="mt-1"
              />
              <Label
                htmlFor="scope-future"
                className="cursor-pointer font-normal"
              >
                <span className="font-semibold block mb-0.5">
                  This and following events
                </span>
                <span className="text-sm text-muted-foreground block mb-2">
                  Changes apply to this and all future events.
                </span>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded w-fit">
                  <AlertCircle className="h-3 w-3" /> Will regenerate future
                  events
                </span>
              </Label>
            </div>
          </RadioGroup>

          {/* Copy Attendees Option - Only show when FUTURE is selected and event has RSVPs */}
          {updateScope === "FUTURE" &&
            initialData &&
            initialData.rsvpCount > 0 && (
              <div className="border-t pt-4 mt-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <Checkbox
                    id="copy-attendees"
                    checked={copyAttendees}
                    onCheckedChange={(checked) =>
                      setCopyAttendees(checked === true)
                    }
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="copy-attendees"
                      className="cursor-pointer font-medium"
                    >
                      Copy attendees to the rescheduled event
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      This event has {initialData.rsvpCount} attendee
                      {initialData.rsvpCount !== 1 ? "s" : ""}. Check this to
                      keep them registered for the new date/time.
                    </p>
                  </div>
                </div>
              </div>
            )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateConfirm} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
