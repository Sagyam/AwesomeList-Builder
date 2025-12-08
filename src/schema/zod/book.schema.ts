import {z} from "zod";
import {BaseResourceSchemaObject} from "@/schema/zod/base.schema";

export const BookSchema = BaseResourceSchemaObject.extend({
  type: z.literal("book"),
  title: z.string().min(1, "Book title is required"),
  author: z.string().min(1, "Author name is required"),
  authorUrl: z.url("Author URL must be a valid URL").optional(),
  isbn: z
    .string()
    .regex(/^(?:\d{9}[\dX]|\d{10})$/, "ISBN must be a valid 10-digit ISBN")
    .optional(),
  isbn13: z
    .string()
    .regex(/^(?:978|979)\d{10}$/, "ISBN-13 must be a valid 13-digit ISBN starting with 978 or 979")
    .optional(),
  published: z.iso.datetime({ message: "Published date must be a valid ISO 8601 datetime" }),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  pages: z.number().int().positive("Pages must be a positive integer").optional(),
  formats: z.array(z.string().min(1)).optional(),
  price: z.string().optional(),
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5")
    .optional(),
});

export type BookInput = z.infer<typeof BookSchema>;
