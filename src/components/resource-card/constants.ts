import type {Types} from "@/schema/ts/types";

/**
 * Unique hover colors for each resource type
 * Applied to the type icon badge on hover
 */
export const TYPE_HOVER_COLORS: Record<Types, string> = {
  library: "group-hover:bg-blue-500 group-hover:text-white",
  article: "group-hover:bg-purple-500 group-hover:text-white",
  video: "group-hover:bg-red-500 group-hover:text-white",
  book: "group-hover:bg-amber-500 group-hover:text-white",
  course: "group-hover:bg-green-500 group-hover:text-white",
  tool: "group-hover:bg-orange-500 group-hover:text-white",
  paper: "group-hover:bg-cyan-500 group-hover:text-white",
  podcast: "group-hover:bg-pink-500 group-hover:text-white",
  documentation: "group-hover:bg-indigo-500 group-hover:text-white",
  repository: "group-hover:bg-emerald-500 group-hover:text-white",
  community: "group-hover:bg-rose-500 group-hover:text-white",
  newsletter: "group-hover:bg-sky-500 group-hover:text-white",
  cheatsheet: "group-hover:bg-lime-500 group-hover:text-white",
  conference: "group-hover:bg-violet-500 group-hover:text-white",
  certification: "group-hover:bg-yellow-500 group-hover:text-white",
};
