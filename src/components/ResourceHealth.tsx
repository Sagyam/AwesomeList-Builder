import * as React from "react";

type HealthStatus = "active" | "maintained" | "stale" | "archived";

interface ResourceHealthProps {
  status: HealthStatus;
  lastUpdated?: string; // ISO date string
  commitActivity?: "high" | "medium" | "low";
  showLabel?: boolean;
}

const healthConfig: Record<
  HealthStatus,
  {
    label: string;
    color: string;
    icon: string;
    description: string;
  }
> = {
  active: {
    label: "Active",
    color: "text-green-600 dark:text-green-400",
    icon: "✓",
    description: "Actively maintained with recent updates",
  },
  maintained: {
    label: "Maintained",
    color: "text-blue-600 dark:text-blue-400",
    icon: "○",
    description: "Regularly maintained",
  },
  stale: {
    label: "Stale",
    color: "text-yellow-600 dark:text-yellow-400",
    icon: "⚠",
    description: "No recent activity",
  },
  archived: {
    label: "Archived",
    color: "text-red-600 dark:text-red-400",
    icon: "✕",
    description: "No longer maintained",
  },
};

const activityConfig = {
  high: {
    label: "High Activity",
    color: "bg-green-500",
  },
  medium: {
    label: "Medium Activity",
    color: "bg-yellow-500",
  },
  low: {
    label: "Low Activity",
    color: "bg-orange-500",
  },
};

export function ResourceHealth({
  status,
  lastUpdated,
  commitActivity,
  showLabel = true,
}: ResourceHealthProps) {
  const config = healthConfig[status];

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return "today";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  };

  return (
    <div className="inline-flex items-center gap-2">
      {/* Health Status */}
      <div
        className={`inline-flex items-center gap-1.5 ${config.color}`}
        title={config.description}
      >
        <span className="text-sm font-medium">{config.icon}</span>
        {showLabel && <span className="text-xs font-medium">{config.label}</span>}
      </div>

      {/* Activity Indicator */}
      {commitActivity && (
        <div
          className="inline-flex items-center gap-1"
          title={activityConfig[commitActivity].label}
        >
          <div className="flex gap-0.5">
            <div className={`h-3 w-0.5 rounded-full ${activityConfig[commitActivity].color}`} />
            <div
              className={`h-3 w-0.5 rounded-full ${
                commitActivity === "high" || commitActivity === "medium"
                  ? activityConfig[commitActivity].color
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
            <div
              className={`h-3 w-0.5 rounded-full ${
                commitActivity === "high"
                  ? activityConfig[commitActivity].color
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Updated {getRelativeTime(lastUpdated)}
        </span>
      )}
    </div>
  );
}
