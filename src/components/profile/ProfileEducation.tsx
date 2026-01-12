"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Calendar,
  BookOpen,
} from "lucide-react";
import { type EducationEntry } from "@/api/profile/profile-api";
import {
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
} from "@/hooks/useProfileQuery";
import { VALIDATION_LIMITS } from "@/lib/validations/profile";
import { SuggestionInput } from "@/components/ui/suggestion-input";
import { useOnlyCollegeIdCompare } from "@/hooks/useOnlyCollegeIdCompare";

interface ProfileEducationProps {
  education: EducationEntry[];
}

export function ProfileEducation({ education }: ProfileEducationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EducationEntry | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collegeOptions, setCollegeOptions] = useState<any[]>([]);

  const addMutation = useAddEducation();
  const updateMutation = useUpdateEducation();
  const deleteMutation = useDeleteEducation();

  const [formData, setFormData] = useState({
    collegeId: null as number | null,
    collegeName: "",
    courseId: null as number | null,
    courseName: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    grade: "",
    description: "",
  });

  // Fetch courses for selected college
  const { courses, loading: coursesLoading } = useOnlyCollegeIdCompare(
    formData.collegeId ? String(formData.collegeId) : null
  );

  const resetForm = () => {
    setFormData({
      collegeId: null,
      collegeName: "",
      courseId: null,
      courseName: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
      grade: "",
      description: "",
    });
    setEditingEntry(null);
    setErrors({});
    setCollegeOptions([]);
  };

  const handleEdit = (entry: EducationEntry) => {
    setEditingEntry(entry);
    setFormData({
      collegeId: entry.collegeId,
      collegeName: entry.collegeName || "",
      courseId: entry.courseId,
      courseName: entry.courseName || "",
      fieldOfStudy: entry.fieldOfStudy || "",
      startYear: entry.startYear?.toString() || "",
      endYear: entry.endYear?.toString() || "",
      grade: entry.grade || "",
      description: entry.description || "",
    });
    setErrors({});
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this education?")) {
      deleteMutation.mutate(id);
    }
  };

  // Fetch college suggestions
  const fetchCollegeSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (!query || query.length < 2) return [];
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/college-search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        const colleges = data.data.colleges || [];
        setCollegeOptions(colleges);
        return colleges.map((c: any) => c.college_name || c.name);
      } catch {
        return [];
      }
    },
    []
  );

  // Handle college selection
  const handleCollegeSelect = (name: string) => {
    const college = collegeOptions.find(
      (c) => (c.college_name || c.name) === name
    );
    if (college) {
      setFormData({
        ...formData,
        collegeName: college.college_name || college.name,
        collegeId: Number(college.college_id || college.id),
        courseId: null,
        courseName: "",
      });
      if (errors.collegeName) setErrors({ ...errors, collegeName: "" });
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseValue: string) => {
    const course = courses.find(
      (c: any) => c.college_wise_course_id?.toString() === courseValue
    );
    if (course) {
      setFormData({
        ...formData,
        courseName: course.name,
        courseId: Number(course.college_wise_course_id),
      });
      if (errors.courseName) setErrors({ ...errors, courseName: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College is required";
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = "Course is required";
    }

    if (formData.startYear) {
      if (!/^\d{4}$/.test(formData.startYear)) {
        newErrors.startYear = "Year must be 4 digits";
      } else {
        const year = parseInt(formData.startYear);
        if (year < 1900 || year > currentYear + 10) {
          newErrors.startYear = "Invalid year";
        }
      }
    }

    if (formData.endYear) {
      if (!/^\d{4}$/.test(formData.endYear)) {
        newErrors.endYear = "Year must be 4 digits";
      } else {
        const year = parseInt(formData.endYear);
        if (year < 1900 || year > currentYear + 10) {
          newErrors.endYear = "Invalid year";
        }
      }
    }

    if (formData.startYear && formData.endYear) {
      const start = parseInt(formData.startYear);
      const end = parseInt(formData.endYear);
      if (!isNaN(start) && !isNaN(end) && end < start) {
        newErrors.endYear = "End year must be after start year";
      }
    }

    if (
      formData.description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH
    ) {
      newErrors.description = `Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      collegeId: formData.collegeId,
      collegeName: formData.collegeName.trim(),
      courseId: formData.courseId,
      courseName: formData.courseName.trim(),
      fieldOfStudy: formData.fieldOfStudy.trim() || null,
      startYear: formData.startYear ? parseInt(formData.startYear) : null,
      endYear: formData.endYear ? parseInt(formData.endYear) : null,
      grade: formData.grade.trim() || null,
      description: formData.description.trim() || null,
    };

    if (editingEntry) {
      updateMutation.mutate(
        { id: editingEntry.id, updates: data },
        {
          onSuccess: () => {
            setIsOpen(false);
            resetForm();
          },
        }
      );
    } else {
      addMutation.mutate(data, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        },
      });
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-0 shadow-xs">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Education</h3>
            <p className="text-sm text-muted-foreground">
              Your academic background
            </p>
          </div>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit" : "Add"} Education
                </DialogTitle>
                <DialogDescription>
                  Fill in your education details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* College Search */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-500" />
                    College/University *
                  </Label>
                  <SuggestionInput
                    value={formData.collegeName}
                    onChange={(value) => {
                      setFormData({
                        ...formData,
                        collegeName: value,
                        collegeId: null,
                        courseId: null,
                        courseName: "",
                      });
                      if (errors.collegeName)
                        setErrors({ ...errors, collegeName: "" });
                    }}
                    onSelect={handleCollegeSelect}
                    fetchSuggestions={fetchCollegeSuggestions}
                    placeholder="Search for your college..."
                    minQueryLength={2}
                    debounceMs={300}
                    className={errors.collegeName ? "border-red-500" : ""}
                  />
                  {errors.collegeName && (
                    <span className="text-xs text-red-500">
                      {errors.collegeName}
                    </span>
                  )}
                </div>

                {/* Course Dropdown */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-500" />
                    Course *
                  </Label>
                  <Select
                    value={
                      courses
                        .find((c: any) => c.name === formData.courseName)
                        ?.college_wise_course_id?.toString() || ""
                    }
                    onValueChange={handleCourseSelect}
                    disabled={!formData.collegeId || coursesLoading}
                  >
                    <SelectTrigger
                      className={errors.courseName ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={
                          !formData.collegeId
                            ? "Select college first"
                            : coursesLoading
                            ? "Loading courses..."
                            : "Select course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {courses
                        .filter((c: any) => c.college_wise_course_id && c.name)
                        .map((c: any) => (
                          <SelectItem
                            key={c.college_wise_course_id}
                            value={c.college_wise_course_id.toString()}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.courseName && (
                    <span className="text-xs text-red-500">
                      {errors.courseName}
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={formData.fieldOfStudy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fieldOfStudy: e.target.value,
                        })
                      }
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({ ...formData, grade: e.target.value })
                      }
                      placeholder="8.5 CGPA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formData.startYear}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setFormData({ ...formData, startYear: val });
                        if (errors.startYear)
                          setErrors({ ...errors, startYear: "" });
                      }}
                      placeholder="2020"
                      className={errors.startYear ? "border-red-500" : ""}
                      maxLength={4}
                    />
                    {errors.startYear && (
                      <span className="text-xs text-red-500">
                        {errors.startYear}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formData.endYear}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setFormData({ ...formData, endYear: val });
                        if (errors.endYear)
                          setErrors({ ...errors, endYear: "" });
                      }}
                      placeholder="2024"
                      className={errors.endYear ? "border-red-500" : ""}
                      maxLength={4}
                    />
                    {errors.endYear && (
                      <span className="text-xs text-red-500">
                        {errors.endYear}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="relative">
                    <Textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        });
                        if (errors.description)
                          setErrors({ ...errors, description: "" });
                      }}
                      placeholder="Activities, achievements..."
                      rows={3}
                      className={errors.description ? "border-red-500" : ""}
                      maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                      {formData.description.length}/
                      {VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                  {errors.description && (
                    <span className="text-xs text-red-500">
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending ? "Saving..." : editingEntry ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Education List */}
        {education.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-500">No education added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-start gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">
                        {entry.courseName || "Unknown Course"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {entry.collegeName || "Unknown College"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {entry.fieldOfStudy && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.fieldOfStudy}
                      </Badge>
                    )}
                    {(entry.startYear || entry.endYear) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.startYear || "?"} - {entry.endYear || "Present"}
                      </span>
                    )}
                    {entry.grade && <span>• {entry.grade}</span>}
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
