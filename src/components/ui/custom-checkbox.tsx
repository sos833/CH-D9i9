"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const CustomCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <label className={cn("checkbox-wrapper", className)}>
      <input type="checkbox" ref={ref} {...props} />
      <div className="checkmark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M20 6L9 17L4 12"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
    </label>
  );
});
CustomCheckbox.displayName = "CustomCheckbox"

export { CustomCheckbox }
