"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Pencil, Sparkles } from "lucide-react";
import { skillSchema, VALIDATION_LIMITS } from "@/lib/validations/profile";

interface ProfileSkillsProps {
  skills: string[];
  onSave: (skills: string[]) => Promise<void>;
}

export function ProfileSkills({ skills, onSave }: ProfileSkillsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>(skills);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedSkills(skills);
  }, [skills]);

  const isAtLimit = editedSkills.length >= VALIDATION_LIMITS.MAX_SKILLS;

  const handleAddSkill = () => {
    const skill = newSkill.trim();

    // Validate skill
    const result = skillSchema.safeParse(skill);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    // Check max limit
    if (isAtLimit) {
      setError(`Maximum ${VALIDATION_LIMITS.MAX_SKILLS} skills allowed`);
      return;
    }

    // Check duplicate
    if (editedSkills.includes(skill)) {
      setError("Skill already added");
      return;
    }

    setEditedSkills([...editedSkills, skill]);
    setNewSkill("");
    setError(null);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedSkills(editedSkills.filter((s) => s !== skillToRemove));
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(editedSkills);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSkills(skills);
    setNewSkill("");
    setError(null);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">Your expertise</h3>
        </div>
        {skills.length > 0 && !isEditing && (
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
          <div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a skill and press Enter..."
                className={`flex-1 ${error ? "border-red-500" : ""}`}
                disabled={isAtLimit}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSkill}
                disabled={isAtLimit}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center mt-1">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <span
                className={`text-xs ml-auto ${
                  isAtLimit ? "text-amber-500" : "text-muted-foreground"
                }`}
              >
                {editedSkills.length}/{VALIDATION_LIMITS.MAX_SKILLS}
              </span>
            </div>
          </div>
          {editedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/30 rounded-lg">
              {editedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer gap-1 pr-1.5"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  {skill}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-10 w-10 text-neutral-300 mb-3" />
          <p className="font-medium text-neutral-500 mb-2">
            No skills added yet
          </p>
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
