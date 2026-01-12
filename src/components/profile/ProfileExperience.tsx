"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Pencil, Trash2, Building2, Calendar } from "lucide-react";
import { type ExperienceEntry } from "@/api/profile/profile-api";
import {
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
} from "@/hooks/useProfileQuery";
import { VALIDATION_LIMITS } from "@/lib/validations/profile";

interface ProfileExperienceProps {
  experience: ExperienceEntry[];
}

export function ProfileExperience({ experience }: ProfileExperienceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExperienceEntry | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMutation = useAddExperience();
  const updateMutation = useUpdateExperience();
  const deleteMutation = useDeleteExperience();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  const resetForm = () => {
    setFormData({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
    setEditingEntry(null);
    setErrors({});
  };

  const handleEdit = (entry: ExperienceEntry) => {
    setEditingEntry(entry);
    setFormData({
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate || "",
      isCurrent: entry.isCurrent,
      description: entry.description || "",
    });
    setErrors({});
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this experience?")) {
      deleteMutation.mutate(id);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    } else if (formData.company.length > VALIDATION_LIMITS.COMPANY_MAX_LENGTH) {
      newErrors.company = `Company must be ${VALIDATION_LIMITS.COMPANY_MAX_LENGTH} characters or less`;
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    } else if (formData.role.length > VALIDATION_LIMITS.ROLE_MAX_LENGTH) {
      newErrors.role = `Role must be ${VALIDATION_LIMITS.ROLE_MAX_LENGTH} characters or less`;
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
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
      company: formData.company.trim(),
      role: formData.role.trim(),
      startDate: formData.startDate,
      endDate: formData.isCurrent ? null : formData.endDate || null,
      isCurrent: formData.isCurrent,
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-0 shadow-xs">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Work Experience</h3>
            <p className="text-sm text-muted-foreground">
              Your professional history
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
                  {editingEntry ? "Edit" : "Add"} Experience
                </DialogTitle>
                <DialogDescription>Fill in your work details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company *</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => {
                        setFormData({ ...formData, company: e.target.value });
                        if (errors.company)
                          setErrors({ ...errors, company: "" });
                      }}
                      placeholder="Company name"
                      className={errors.company ? "border-red-500" : ""}
                      maxLength={VALIDATION_LIMITS.COMPANY_MAX_LENGTH}
                    />
                    {errors.company && (
                      <span className="text-xs text-red-500">
                        {errors.company}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => {
                        setFormData({ ...formData, role: e.target.value });
                        if (errors.role) setErrors({ ...errors, role: "" });
                      }}
                      placeholder="Job title"
                      className={errors.role ? "border-red-500" : ""}
                      maxLength={VALIDATION_LIMITS.ROLE_MAX_LENGTH}
                    />
                    {errors.role && (
                      <span className="text-xs text-red-500">
                        {errors.role}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData({ ...formData, startDate: e.target.value });
                        if (errors.startDate)
                          setErrors({ ...errors, startDate: "" });
                      }}
                      className={errors.startDate ? "border-red-500" : ""}
                    />
                    {errors.startDate && (
                      <span className="text-xs text-red-500">
                        {errors.startDate}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      disabled={formData.isCurrent}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="current"
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isCurrent: !!checked })
                    }
                  />
                  <Label
                    htmlFor="current"
                    className="font-normal cursor-pointer"
                  >
                    I currently work here
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Description</Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.description.length}/
                      {VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description)
                        setErrors({ ...errors, description: "" });
                    }}
                    rows={3}
                    placeholder="What did you do?"
                    className={errors.description ? "border-red-500" : ""}
                    maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
                  />
                  {errors.description && (
                    <span className="text-xs text-red-500">
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {experience.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Building2 className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No experience added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {experience.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex gap-4 ${
                  index !== experience.length - 1 ? "pb-4 border-b" : ""
                }`}
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{entry.role}</h4>
                      <p className="text-sm text-muted-foreground">
                        {entry.company}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.startDate)} —{" "}
                      {entry.isCurrent ? (
                        <Badge variant="secondary" className="text-xs py-0">
                          Present
                        </Badge>
                      ) : entry.endDate ? (
                        formatDate(entry.endDate)
                      ) : (
                        "Present"
                      )}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mt-2">
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
