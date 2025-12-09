import * as React from "react";
import {Grid3x3, List} from "lucide-react";

type LayoutMode = "grid" | "list";

interface LayoutToggleProps {
  value: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export function LayoutToggle({ value, onChange }: LayoutToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-input bg-background p-1">
      <button
        onClick={() => onChange("grid")}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          value === "grid"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
        aria-label="Grid view"
      >
        <Grid3x3 className="h-4 w-4"/>
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onChange("list")}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          value === "list"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        }`}
        aria-label="List view"
      >
        <List className="h-4 w-4"/>
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
