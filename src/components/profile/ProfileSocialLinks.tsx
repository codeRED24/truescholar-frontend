"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Linkedin,
  Github,
  Globe,
  Twitter,
  Pencil,
  ExternalLink,
  Link2,
  Plus,
} from "lucide-react";
import { z } from "zod";

const urlSchema = z.string().url("Invalid URL").or(z.literal(""));

interface ProfileSocialLinksProps {
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl: string;
  websiteUrl: string;
  onSave: (links: {
    linkedin_url?: string | null;
    twitter_url?: string | null;
    github_url?: string | null;
    website_url?: string | null;
  }) => Promise<void>;
}

export function ProfileSocialLinks({
  linkedinUrl,
  twitterUrl,
  githubUrl,
  websiteUrl,
  onSave,
}: ProfileSocialLinksProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    linkedin: linkedinUrl,
    twitter: twitterUrl,
    github: githubUrl,
    website: websiteUrl,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      linkedin: linkedinUrl,
      twitter: twitterUrl,
      github: githubUrl,
      website: websiteUrl,
    });
  }, [linkedinUrl, twitterUrl, githubUrl, websiteUrl]);

  const validateUrl = (key: string, value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
      return true;
    }
    const result = urlSchema.safeParse(value);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [key]: "Invalid URL" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
    return true;
  };

  const handleSave = async () => {
    // Validate all URLs
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (value && !urlSchema.safeParse(value).success) {
        newErrors[key] = "Invalid URL";
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    await onSave({
      linkedin_url: formData.linkedin || null,
      twitter_url: formData.twitter || null,
      github_url: formData.github || null,
      website_url: formData.website || null,
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      linkedin: linkedinUrl,
      twitter: twitterUrl,
      github: githubUrl,
      website: websiteUrl,
    });
    setErrors({});
    setIsEditing(false);
  };

  const hasLinks = linkedinUrl || twitterUrl || githubUrl || websiteUrl;
  const hasErrors = Object.values(errors).some((e) => e);

  const linkItems = [
    {
      key: "linkedin",
      icon: Linkedin,
      label: "LinkedIn",
      value: linkedinUrl,
      color: "text-[#0A66C2]",
    },
    {
      key: "twitter",
      icon: Twitter,
      label: "Twitter",
      value: twitterUrl,
      color: "text-[#1DA1F2]",
    },
    {
      key: "github",
      icon: Github,
      label: "GitHub",
      value: githubUrl,
      color: "text-[#333]",
    },
    {
      key: "website",
      icon: Globe,
      label: "Website",
      value: websiteUrl,
      color: "text-purple-600",
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">Social Links</h3>
        </div>
        {hasLinks && !isEditing && (
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
          <div className="grid gap-3">
            {linkItems.map((item) => (
              <div key={item.key}>
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${item.color}`}
                  />
                  <Input
                    value={formData[item.key as keyof typeof formData]}
                    onChange={(e) => {
                      setFormData({ ...formData, [item.key]: e.target.value });
                      validateUrl(item.key, e.target.value);
                    }}
                    placeholder={`${item.label} URL`}
                    className={`flex-1 ${
                      errors[item.key] ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors[item.key] && (
                  <span className="text-xs text-red-500 ml-7">
                    {errors[item.key]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || hasErrors}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : hasLinks ? (
        <div className="space-y-2">
          {linkItems
            .filter((item) => item.value)
            .map((item) => (
              <a
                key={item.key}
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="flex-1 truncate">{item.label}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Link2 className="h-10 w-10 text-neutral-300 mb-3" />
          <p className="font-medium text-neutral-500 mb-2">
            No links added yet
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
