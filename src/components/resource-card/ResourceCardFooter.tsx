import {Scale, Star} from "lucide-react";
import {RegistryBadge} from "@/components/RegistryBadge";
import {CardFooter} from "@/components/ui/card";

type Registry = "npm" | "pypi" | "cargo" | "rubygems" | "maven" | "nuget" | "go" | "packagist";

interface ResourceCardFooterProps {
  registry?: Registry;
  packageName?: string;
  lastReleaseVersion?: string;
  techIcons: string[];
  techList: string[];
  stars?: number;
  license?: string;
}

/**
 * Footer section for ResourceCard
 * Displays registry badge, tech icons, stars count, and license
 */
export function ResourceCardFooter({
  registry,
  packageName,
  lastReleaseVersion,
  techIcons,
  techList,
  stars,
  license,
}: ResourceCardFooterProps) {
  return (
    <CardFooter className="justify-between">
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        {registry && (
          <RegistryBadge
            registry={registry}
            packageName={packageName}
            lastReleaseVersion={lastReleaseVersion}
          />
        )}
        {techIcons.length > 0 && (
          <div className="flex items-center gap-1.5">
            {techIcons.map((iconClass, index) => (
              <i
                key={`${techList[index]}-${index}`}
                className={`${iconClass} text-base`}
                title={techList[index]}
              />
            ))}
          </div>
        )}
        {stars !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
            <span>{stars.toLocaleString()}</span>
          </div>
        )}
        {license && (
          <div className="flex items-center gap-1">
            <Scale className="h-4 w-4" />
            <span>{license}</span>
          </div>
        )}
      </div>
    </CardFooter>
  );
}
