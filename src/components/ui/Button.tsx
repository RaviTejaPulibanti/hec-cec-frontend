import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a14e40]/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]";

    const variants = {
      primary: "bg-gradient-to-r from-[#a14e40] to-[#8a3f33] text-white shadow-lg shadow-[#a14e40]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#a14e40]/30",
      secondary: "bg-[#f4e7e4] text-[#8a3f33] hover:bg-[#f0ddd9]",
      outline: "border border-[#a14e40]/30 bg-white/80 text-[#a14e40] hover:bg-[#a14e40]/5",
      danger: "bg-gradient-to-r from-[#a14e40] to-[#8a3f33] text-white shadow-lg shadow-[#a14e40]/25 hover:-translate-y-0.5",
      ghost: "bg-transparent text-[#a14e40] hover:bg-[#a14e40]/10",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
