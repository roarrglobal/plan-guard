import { cn } from "@/lib/utils";
import { getDeptStyle, DEPARTMENTS } from "@/lib/departments";

interface DepartmentBadgeProps {
  department: string;
  className?: string;
  size?: "sm" | "md";
}

export function DepartmentBadge({ department, className, size = "sm" }: DepartmentBadgeProps) {
  const style = getDeptStyle(department);
  const label = DEPARTMENTS.find(d => d.value === department)?.label || department;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      style.bg, style.text, style.border, "border",
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
      {label}
    </span>
  );
}
