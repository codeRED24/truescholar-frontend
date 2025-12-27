import { z } from "zod";

// Bio validation
export const bioSchema = z
  .string()
  .max(100, "Bio must be 100 characters or less");

// Skills validation
export const skillSchema = z
  .string()
  .min(1, "Skill cannot be empty")
  .max(50, "Skill must be 50 characters or less");
export const skillsArraySchema = z
  .array(skillSchema)
  .max(8, "Maximum 8 skills allowed");

// URL validation helper
const urlSchema = z.string().url("Invalid URL format").or(z.literal(""));

// Social links validation
export const socialLinksSchema = z.object({
  linkedin_url: urlSchema.nullable().optional(),
  twitter_url: urlSchema.nullable().optional(),
  github_url: urlSchema.nullable().optional(),
  website_url: urlSchema.nullable().optional(),
});

// Experience validation
export const experienceSchema = z.object({
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company must be 100 characters or less"),
  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role must be 100 characters or less"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
});

// Education validation
export const educationSchema = z.object({
  collegeId: z.number().nullable().optional(),
  collegeName: z
    .string()
    .min(1, "College is required")
    .max(100, "College name must be 100 characters or less"),
  courseId: z.number().nullable().optional(),
  courseName: z
    .string()
    .min(1, "Course is required")
    .max(100, "Course name must be 100 characters or less"),
  fieldOfStudy: z
    .string()
    .max(100, "Field of study must be 100 characters or less")
    .nullable()
    .optional(),
  startYear: z.number().min(1900).max(2100).nullable().optional(),
  endYear: z.number().min(1900).max(2100).nullable().optional(),
  grade: z
    .string()
    .max(20, "Grade must be 20 characters or less")
    .nullable()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
});

// Avatar validation
export const avatarSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be 5MB or less")
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        ),
      "Only JPEG, PNG, WebP, and GIF images are allowed"
    ),
});

// Validation constants
export const VALIDATION_LIMITS = {
  BIO_MAX_LENGTH: 100,
  SKILL_MAX_LENGTH: 50,
  MAX_SKILLS: 8,
  AVATAR_MAX_SIZE_MB: 5,
  AVATAR_MAX_SIZE_BYTES: 5 * 1024 * 1024,
  COMPANY_MAX_LENGTH: 100,
  ROLE_MAX_LENGTH: 100,
  INSTITUTION_MAX_LENGTH: 100,
  DEGREE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

// Type exports
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
