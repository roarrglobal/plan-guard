export const DEPARTMENTS = [
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "product", label: "Product" },
  { value: "hr", label: "HR" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "strategy", label: "Strategy" },
] as const;

export type DepartmentType = typeof DEPARTMENTS[number]["value"];

export const DEPARTMENT_STYLES: Record<DepartmentType, { bg: string; text: string; border: string; dot: string }> = {
  sales: { bg: "bg-dept-sales/10", text: "text-dept-sales", border: "border-dept-sales/30", dot: "bg-dept-sales" },
  finance: { bg: "bg-dept-finance/10", text: "text-dept-finance", border: "border-dept-finance/30", dot: "bg-dept-finance" },
  product: { bg: "bg-dept-product/10", text: "text-dept-product", border: "border-dept-product/30", dot: "bg-dept-product" },
  hr: { bg: "bg-dept-hr/10", text: "text-dept-hr", border: "border-dept-hr/30", dot: "bg-dept-hr" },
  marketing: { bg: "bg-dept-marketing/10", text: "text-dept-marketing", border: "border-dept-marketing/30", dot: "bg-dept-marketing" },
  operations: { bg: "bg-dept-operations/10", text: "text-dept-operations", border: "border-dept-operations/30", dot: "bg-dept-operations" },
  strategy: { bg: "bg-dept-strategy/10", text: "text-dept-strategy", border: "border-dept-strategy/30", dot: "bg-dept-strategy" },
};

export function getDeptStyle(dept: string) {
  return DEPARTMENT_STYLES[dept as DepartmentType] || DEPARTMENT_STYLES.strategy;
}
