"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, FileText, Plus } from "lucide-react";
import { bioSchema, VALIDATION_LIMITS } from "@/lib/validations/profile";

interface ProfileBioProps {
  bio: string;
  onSave: (bio: string) => Promise<void>;
}

export function ProfileBio({ bio, onSave }: ProfileBioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(bio);
  }, [bio]);

  const charCount = value.length;
  const isOverLimit = charCount > VALIDATION_LIMITS.BIO_MAX_LENGTH;

  const handleSave = async () => {
    const result = bioSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setSaving(true);
    await onSave(value);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(bio);
    setError(null);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">Tell us about yourself</h3>
        </div>
        {bio && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 h-8 text-neutral-500 hover:text-neutral-600"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="Write something about yourself..."
              rows={4}
              className={`resize-none ${
                isOverLimit || error
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <span
                className={`text-xs ml-auto ${
                  isOverLimit ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {charCount}/{VALIDATION_LIMITS.BIO_MAX_LENGTH}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || isOverLimit}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : bio ? (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {bio}
        </p>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-10 w-10 text-neutral-300 mb-1" />
          <p className="font-medium text-neutral-500 mb-2">No bio added yet</p>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
