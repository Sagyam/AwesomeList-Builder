import {z} from "zod";
import {BaseResourceSchemaObject} from "@/schema/zod/base.schema";

export const CertificationSchema = BaseResourceSchemaObject.extend({
  type: z.literal("certification"),
  title: z.string().min(1, "Certification title is required"),
  provider: z.string().min(1, "Provider name is required"),
  providerUrl: z.url("Provider URL must be a valid URL").optional(),
  credentialUrl: z.url("Credential URL must be a valid URL").optional(),
  examCode: z.string().optional(),
  duration: z.string().optional(),
  examDuration: z.string().optional(),
  cost: z.string().optional(),
  prerequisites: z
    .array(z.string().min(1), {
      error: "Prerequisites must be an array of strings",
    })
    .optional(),
  topics: z
    .array(z.string().min(1), {
      error: "Topics must be an array of strings",
    })
    .optional(),
  format: z.string().optional(),
  passingScore: z
    .number()
    .min(0, "Passing score must be between 0 and 100")
    .max(100, "Passing score must be between 0 and 100")
    .optional(),
  renewalRequired: z.boolean().optional(),
  recognizedBy: z
    .array(z.string().min(1), {
      error: "Recognized by must be an array of strings",
    })
    .optional(),
});

export type CertificationInput = z.infer<typeof CertificationSchema>;
