import type * as React from "react";

type Registry = "npm" | "pypi" | "cargo" | "rubygems" | "maven" | "nuget" | "go" | "packagist";

interface RegistryBadgeProps {
  registry: Registry;
  packageName?: string;
  version?: string;
  downloads?: number;
  url?: string;
}

const registryConfig: Record<
  Registry,
  {
    name: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  npm: {
    name: "npm",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
      </svg>
    ),
  },
  pypi: {
    name: "PyPI",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L1.608 6v12L12 24l10.392-6V6L12 0zm-1.433 7.568l3.067 1.771v3.542l-3.067-1.771V7.568zM7.5 10.65l3.067 1.772v3.542L7.5 14.192V10.65zm5 11.11l-3.067-1.771v-3.542l3.067 1.771v3.542zm1.433-4.237V14.03l3.067-1.771v3.542l-3.067 1.771zm0-8.653v3.542l-3.067 1.771V10.65l3.067-1.771zm4.567 6.882l-3.067 1.771v-3.542l3.067-1.771v3.542z" />
      </svg>
    ),
  },
  cargo: {
    name: "Cargo",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 5.5h3l.5 3h-4l.5-3zm-2.5 4h8l-4 8-4-8z" />
      </svg>
    ),
  },
  rubygems: {
    name: "RubyGems",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L3.5 7.5L12 15l8.5-7.5L12 0zm0 16.5L3.5 9v6L12 24l8.5-9V9l-8.5 7.5z" />
      </svg>
    ),
  },
  maven: {
    name: "Maven",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.37l7 3.5v7.76l-7-3.5V9.37zm16 0v7.76l-7 3.5v-7.76l7-3.5z" />
      </svg>
    ),
  },
  nuget: {
    name: "NuGet",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.37l7 3.5v7.76l-7-3.5V9.37zm16 0v7.76l-7 3.5v-7.76l7-3.5z" />
      </svg>
    ),
  },
  go: {
    name: "Go Packages",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.059-.117.059zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.958-1.17.129-2.263-.058-3.245-.77-1.064-.78-1.658-1.835-1.752-3.115-.105-1.416.175-2.68 1.063-3.805.782-.99 1.812-1.577 3.062-1.8 1.192-.21 2.314-.094 3.33.595.923.63 1.496 1.485 1.798 2.526.035.117.023.14-.093.163z" />
      </svg>
    ),
  },
  packagist: {
    name: "Packagist",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 5.5h3l.5 3h-4l.5-3zm-2.5 4h8l-4 8-4-8z" />
      </svg>
    ),
  },
};

export function RegistryBadge({
  registry,
  packageName,
  version,
  downloads,
  url,
}: RegistryBadgeProps) {
  const config = registryConfig[registry];

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${config.color}`}
    >
      {config.icon}
      <span className="font-semibold">{config.name}</span>
      {version && <span className="opacity-75">v{version}</span>}
      {downloads !== undefined && (
        <span className="opacity-75">{downloads.toLocaleString()} ↓</span>
      )}
    </span>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return content;
}
