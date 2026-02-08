"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, MapPin, ImageIcon, Users, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { useCreateEvent, useUpdateEvent } from "../../hooks/use-events";
import { useCollegeMemberships } from "../../hooks/use-memberships";
import { uploadPostMedia } from "../../api/social-api";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { type OrganizerType, type Event, EventSilo } from "../../types";

const recurrenceSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.coerce.number().min(1).default(1),
  count: z.coerce.number().min(1).optional(),
  until: z.string().optional(),
}).refine(data => data.count || data.until, {
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
  capacity: z.coerce.number().min(1).optional(),
  recurring: z.boolean().default(false),
  recurrence: recurrenceSchema.optional(),
});

type EventFormData = z.infer<typeof baseEventSchema>;

const getEventSchema = (mode: "create" | "edit") => {
  // Base refinement for recurrence
  const withRecurrence = baseEventSchema.refine((data) => {
    if (data.recurring && !data.recurrence) return false;
    return true;
  }, {
    message: "Recurrence details are required for recurring events",
    path: ["recurrence"],
  });

  if (mode === "create") {
    return withRecurrence.and(
      z.object({
        startTime: z.string().refine((val) => new Date(val) > new Date(), {
          message: "Start time must be in the future",
        }),
      })
    ).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
      message: "End time must be after start time",
      path: ["endTime"],
    });
  }

  // Edit mode - no future requirement on startTime
  return withRecurrence.refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });
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
  
  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending;

  // Filter for admin memberships
  const adminMemberships = memberships.filter(
    (m) => m.role === "college_admin" || m.role === "admin" || m.role === "owner"
  );

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(
    mode === "edit" && initialData?.mediaUrl ? initialData.mediaUrl : null
  );
  const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Dialog State for Recurring Updates
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateScope, setUpdateScope] = useState<"SINGLE" | "FUTURE">("SINGLE");
  const [copyAttendees, setCopyAttendees] = useState(false);
  const [pendingData, setPendingData] = useState<EventFormData | null>(null);
  
  const hasProcessedUrlParam = useRef(false);

  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().slice(0, 16);
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
      startTime: formatDateForInput(initialData?.startTime),
      endTime: formatDateForInput(initialData?.endTime),
      organizerType: initialData?.organizerType || "user",
      organizerCollegeId: initialData?.organizerCollegeId ? String(initialData.organizerCollegeId) : undefined,
      silo: initialData?.silo || EventSilo.OTHER,
      capacity: initialData?.capacity || undefined,
      recurring: initialData?.recurring || false,
      recurrence: {
        frequency: initialData?.recurrence?.frequency ?? "WEEKLY",
        interval: initialData?.recurrence?.interval ?? 1,
        count: initialData?.recurrence?.count ?? 10,
        until: initialData?.recurrence?.until ?? undefined,
      }
    },
  });

  const organizerType = watch("organizerType");
  const isRecurring = useWatch({ control, name: "recurring" });
  
  // Track recurrence end mode (count vs until) - initialize based on initialData
  const [recurrenceEndMode, setRecurrenceEndMode] = useState<"count" | "until">(
    initialData?.recurrence?.until ? "until" : "count"
  );

  // Handle URL param for pre-selecting college (only in create mode)
  useEffect(() => {
    if (mode === "edit") return;

    const collegeIdParam = searchParams.get("collegeId");
    
    if (!collegeIdParam || hasProcessedUrlParam.current || adminMemberships.length === 0) {
      return;
    }

    const targetCollege = adminMemberships.find(
      (m) => String(m.collegeId) === collegeIdParam
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

  const processSubmit = async (data: EventFormData, scope: "SINGLE" | "FUTURE" = "SINGLE", shouldCopyAttendees: boolean = false) => {
    try {
      if (mode === "create" && data.organizerType === "college" && !data.organizerCollegeId) {
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
          count: recurrenceEndMode === "count" ? data.recurrence.count : undefined,
          until: recurrenceEndMode === "until" && data.recurrence.until ? new Date(data.recurrence.until).toISOString() : undefined,
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
          organizerUserId: data.organizerType === "user" ? session?.user.id : undefined,
          organizerCollegeId: data.organizerType === "college" && data.organizerCollegeId 
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {mode === "edit" && initialData?.recurring && (
          <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center gap-2 border border-blue-100 dark:border-blue-900">
            <Repeat className="h-4 w-4" />
            <span className="text-sm font-medium">
              This is a recurring event.
            </span>
          </div>
        )}

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          {mediaPreview ? (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="object-cover w-full h-full"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative bg-card">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="bg-primary/10 p-3 rounded-full">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium">
                  {mode === "edit" ? "Click to replace cover image" : "Click or drag to upload cover image"}
                </p>
                <p className="text-xs">Recommended: 16:9 ratio, max 5MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Annual Tech Symposium" 
              {...register("title")} 
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="silo">Category</Label>
              <Select 
                value={watch("silo")} 
                onValueChange={(val) => setValue("silo", val as EventSilo)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EventSilo.ACADEMIC}>Academic</SelectItem>
                  <SelectItem value={EventSilo.ADMISSION}>Admission</SelectItem>
                  <SelectItem value={EventSilo.EXAM}>Exam</SelectItem>
                  <SelectItem value={EventSilo.CAREER}>Career</SelectItem>
                  <SelectItem value={EventSilo.CULTURAL}>Cultural</SelectItem>
                  <SelectItem value={EventSilo.SPORTS}>Sports</SelectItem>
                  <SelectItem value={EventSilo.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.silo && (
                <p className="text-sm text-destructive">{errors.silo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="capacity" 
                  type="number"
                  min="1"
                  className="pl-9"
                  placeholder="Unlimited" 
                  {...register("capacity")} 
                />
              </div>
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Input 
                  id="startTime" 
                  type="datetime-local" 
                  {...register("startTime")} 
                />
              </div>
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                type="datetime-local" 
                {...register("endTime")} 
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location" 
                className="pl-9"
                placeholder="e.g. Main Auditorium or Online" 
                {...register("location")} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Tell people what your event is about..." 
              className="min-h-[120px]"
              {...register("description")} 
            />
          </div>
        </div>

        {/* Recurrence Section (Always visible if enabled or new) */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  <Label className="text-base">Repeat Event</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create multiple instances of this event automatically
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("recurring", checked)}
              />
            </div>

            {isRecurring && (
              <div className="grid gap-6 border-t pt-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select 
                      value={watch("recurrence.frequency")} 
                      onValueChange={(val: any) => setValue("recurrence.frequency", val)}
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
                        {...register("recurrence.interval")} 
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {watch("recurrence.frequency") === "DAILY" ? "Days" : 
                         watch("recurrence.frequency") === "WEEKLY" ? "Weeks" :
                         watch("recurrence.frequency") === "MONTHLY" ? "Months" : "Years"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Ends</Label>
                  <RadioGroup 
                    value={recurrenceEndMode} 
                    onValueChange={(val: "count" | "until") => setRecurrenceEndMode(val)}
                    className="grid gap-3"
                  >
                    <div className="flex items-center justify-between gap-4 border p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="count" id="end-count" />
                        <Label htmlFor="end-count">After occurrences</Label>
                      </div>
                      <Input 
                        type="number" 
                        min="1" 
                        className="w-24 h-8"
                        disabled={recurrenceEndMode !== "count"}
                        {...register("recurrence.count")}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 border p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="until" id="end-until" />
                        <Label htmlFor="end-until">On date</Label>
                      </div>
                      <Input 
                        type="date"
                        className="w-auto h-8"
                        disabled={recurrenceEndMode !== "until"}
                        {...register("recurrence.until")}
                      />
                    </div>
                  </RadioGroup>
                  {errors.recurrence?.until && (
                    <p className="text-sm text-destructive mt-1">{errors.recurrence.until.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizer Selector */}
        {mode === "create" ? (
          adminMemberships.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label>Organize As</Label>
                  <RadioGroup 
                    value={organizerType} 
                    onValueChange={(val) => setValue("organizerType", val as "user" | "college")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="org-user" className="peer sr-only" />
                      <Label
                        htmlFor="org-user"
                        className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 w-full"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session?.user.image || undefined} />
                          <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{session?.user.name} (Me)</div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="college" id="org-college" className="peer sr-only" />
                      <Label
                        htmlFor="org-college"
                        className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 w-full"
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div className="font-medium">My College</div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {organizerType === "college" && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="college-select" className="mb-2 block">Select College</Label>
                      <Select 
                        value={watch("organizerCollegeId") || ""} 
                        onValueChange={(val) => setValue("organizerCollegeId", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                        <SelectContent>
                          {adminMemberships.map((m) => (
                            <SelectItem key={m.collegeId} value={String(m.collegeId)}>
                              {m.college.college_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.organizerCollegeId && (
                         <p className="text-sm text-destructive mt-1">Please select a college</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          // Edit Mode - Read Only Organizer
          <Card>
            <CardContent className="pt-6">
              <Label className="mb-2 block">Organized By</Label>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={initialData?.organizerType === "college" 
                    ? initialData?.organizerCollege?.logo_img || undefined
                    : initialData?.organizerUser?.image || undefined} 
                  />
                  <AvatarFallback>
                    {(initialData?.organizerType === "college" 
                      ? initialData?.organizerCollege?.college_name 
                      : initialData?.organizerUser?.name)?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">
                  {initialData?.organizerType === "college" 
                    ? initialData?.organizerCollege?.college_name 
                    : initialData?.organizerUser?.name}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Organizer cannot be changed after event creation.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
          >
            {(isSubmitting || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "create" ? "Create Event" : "Save Changes"}
          </Button>
        </div>
      </form>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update recurring event</DialogTitle>
            <DialogDescription>
              This is a repeating event. How would you like to apply your changes?
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={updateScope} onValueChange={(val: any) => setUpdateScope(val)}>
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="SINGLE" id="scope-single" />
              <Label htmlFor="scope-single" className="cursor-pointer">
                <span className="font-medium block">This event only</span>
                <span className="text-xs text-muted-foreground">Changes apply only to this specific instance</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="FUTURE" id="scope-future" />
              <Label htmlFor="scope-future" className="cursor-pointer">
                <span className="font-medium block">This and following events</span>
                <span className="text-xs text-muted-foreground">
                  Changes apply to this and all future events. 
                  <span className="text-destructive block mt-1">Warning: Changing schedule/recurrence will regenerate future events.</span>
                </span>
              </Label>
            </div>
          </RadioGroup>
          
          {/* Copy Attendees Option - Only show when FUTURE is selected and event has RSVPs */}
          {updateScope === "FUTURE" && initialData && initialData.rsvpCount > 0 && (
            <div className="border-t pt-4 mt-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <Checkbox 
                  id="copy-attendees" 
                  checked={copyAttendees}
                  onCheckedChange={(checked) => setCopyAttendees(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="copy-attendees" className="cursor-pointer font-medium">
                    Copy attendees to the rescheduled event
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This event has {initialData.rsvpCount} attendee{initialData.rsvpCount !== 1 ? 's' : ''}. 
                    Check this to keep them registered for the new date/time.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateConfirm} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
