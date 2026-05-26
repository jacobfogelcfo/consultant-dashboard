import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/10 text-primary",
  positive: "bg-green-50 text-green-700 border border-green-200",
  negative: "bg-red-50 text-red-600 border border-red-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  neutral: "bg-muted text-muted-foreground",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  projected: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  income: "bg-green-50 text-green-700 border border-green-200",
  expense: "bg-red-50 text-red-600 border border-red-200",
};

export function Badge({ children, variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}