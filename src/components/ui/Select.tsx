import React, { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", containerClassName = "", children, ...props }, ref) => (
    <div className={`relative w-full ${containerClassName}`}>
      <select
        ref={ref}
        className={`h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 pr-10 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-[#a14e40] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a14e40]/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
);

Select.displayName = "Select";

export { Select };