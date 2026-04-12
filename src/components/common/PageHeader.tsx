import { ReactNode } from "react";

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string;
  action?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
}

export default function PageHeader({
  title,
  action,
  search,
  filters,
}: PageHeaderProps) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg border border-slate-200 shrink-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          {typeof title === "string" ? (
            <h1 className="text-base md:text-lg font-semibold text-slate-900">
              {title}
            </h1>
          ) : (
            title
          )}
          {/* Mobile Action Button */}
          <div className="md:hidden shrink-0">{action}</div>
        </div>
        <div className="flex flex-1 items-center gap-3 w-full md:justify-end">
          {search && <div className="flex-1 md:max-w-xs w-full">{search}</div>}
          {filters && (
            <div className="flex items-center gap-2 shrink-0">{filters}</div>
          )}
          {/* Desktop Action Button */}
          {action && <div className="hidden md:block shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
