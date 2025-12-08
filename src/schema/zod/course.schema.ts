import { z } from "zod";
import { BaseResourceSchema } from "./base.schema";

export const CourseSchema = BaseResourceSchema.extend({
  type: z.literal("course"),
  title: z.string().min(1, "Course title is required"),
  platform: z.string().min(1, "Platform name is required (e.g., Udemy, Coursera)"),
  instructor: z.string().min(1, "Instructor name is required"),
  instructorUrl: z.string().url("Instructor URL must be a valid URL").optional(),
  published: z.string().datetime({ message: "Published date must be a valid ISO 8601 datetime" }),
  updated: z
    .string()
    .datetime({ message: "Updated date must be a valid ISO 8601 datetime" })
    .optional(),
  duration: z.string().optional(),
  lessons: z.number().int().positive("Number of lessons must be a positive integer").optional(),
  hasSubtitles: z.boolean().optional(),
  price: z.string().optional(),
  discountPrice: z.string().optional(),
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .optional(),
  students: z
    .number()
    .int()
    .nonnegative("Number of students must be a non-negative integer")
    .optional(),
  certificate: z.boolean().optional(),
  prerequisites: z.array(z.string().min(1)).optional(),
});

export type CourseInput = z.infer<typeof CourseSchema>;
