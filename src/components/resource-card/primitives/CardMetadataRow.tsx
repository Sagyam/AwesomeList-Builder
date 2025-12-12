import type {LucideIcon} from "lucide-react";
import type {ReactNode} from "react";

interface CardMetadataRowProps {
  icon?: LucideIcon;
  label?: string;
  value: ReactNode;
  className?: string;
}

/**
 * Reusable metadata row for displaying key-value pairs in cards
 */
export function CardMetadataRow({
  icon: Icon,
  label,
  value,
  className = "",
}: CardMetadataRowProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      {Icon && <Icon className="h-4 w-4" />}
      {label && <span>{label}:</span>}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
