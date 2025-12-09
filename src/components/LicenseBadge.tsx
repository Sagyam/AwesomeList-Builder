import * as React from "react";
import {DollarSign} from "lucide-react";

interface LicenseBadgeProps {
  license: string;
  showIcon?: boolean;
}

const licenseColors: Record<string, string> = {
  MIT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Apache: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Apache-2.0": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  GPL: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "GPL-3.0": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  BSD: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "BSD-3-Clause": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  ISC: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  CC0: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Unlicense: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function LicenseBadge({ license, showIcon = true }: LicenseBadgeProps) {
  const colorClass =
    licenseColors[license] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}
    >
      {showIcon && <DollarSign className="h-3.5 w-3.5"/>}
      {license}
    </span>
  );
}
