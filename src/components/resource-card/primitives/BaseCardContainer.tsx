import type {ReactNode} from "react";
import {Card} from "@/components/ui/card";

interface BaseCardContainerProps {
  id: string;
  children: ReactNode;
}

/**
 * Base container for all resource cards
 * Provides consistent hover effects and link wrapping
 */
export function BaseCardContainer({ id, children }: BaseCardContainerProps) {
  return (
    <a href={`/resources/${id}`} className="block group">
      <Card className="transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 overflow-hidden h-full">
        {children}
      </Card>
    </a>
  );
}
