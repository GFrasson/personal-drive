import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  currentPath: string[];
  onClick: (path: string[]) => void;
}

export function Breadcrumb({ currentPath, onClick }: BreadcrumbProps) {
  const handleBreadcrumbClick = (index: number) => {
    onClick(currentPath.slice(0, index + 1));
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Home
        className="h-4 w-4 cursor-pointer"
        onClick={() => onClick([])}
      />
      
      {currentPath.map((segment, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <span
            className="cursor-pointer hover:underline"
            onClick={() => handleBreadcrumbClick(index)}
          >
            {segment}
          </span>
        </div>
      ))}
    </div>
  )
}