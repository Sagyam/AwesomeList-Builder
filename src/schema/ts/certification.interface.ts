import type { BaseResource } from "@/schema/ts/base.interface";

export interface Certification extends BaseResource {
  type: "certification";
  title: string;
  provider: string;
  providerUrl?: string;
  credentialUrl?: string;
  examCode?: string;
  duration?: string; // Validity duration (e.g., "3 years", "lifetime")
  examDuration?: string; // Exam length
  cost?: string;
  prerequisites?: string[];
  format?: string; // Online, In-person, Proctored, etc.
  passingScore?: number;
  renewalRequired?: boolean;
  recognizedBy?: string[]; // Organizations that recognize this cert
}
