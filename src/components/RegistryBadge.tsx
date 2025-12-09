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
    iconClass: string;
  }
> = {
  npm: {
    name: "npm",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    iconClass: "devicon-npm-original-wordmark",
  },
  pypi: {
    name: "PyPI",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    iconClass: "devicon-python-plain",
  },
  cargo: {
    name: "Cargo",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    iconClass: "devicon-rust-plain",
  },
  rubygems: {
    name: "RubyGems",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    iconClass: "devicon-ruby-plain",
  },
  maven: {
    name: "Maven",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    iconClass: "devicon-maven-plain",
  },
  nuget: {
    name: "NuGet",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    iconClass: "devicon-nuget-original",
  },
  go: {
    name: "Go Packages",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    iconClass: "devicon-go-original-wordmark",
  },
  packagist: {
    name: "Packagist",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    iconClass: "devicon-php-plain",
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
      <i className={`${config.iconClass} text-sm`}></i>
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
