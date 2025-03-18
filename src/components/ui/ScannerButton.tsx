
import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScannerButtonProps extends ButtonProps {
  isScanning?: boolean;
}

const ScannerButton = forwardRef<HTMLButtonElement, ScannerButtonProps>(
  ({ className, isScanning, children, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300 shadow-sm",
          isScanning && "animate-pulse-subtle",
          className
        )}
        disabled={disabled || isScanning}
        ref={ref}
        {...props}
      >
        {isScanning ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            Scanning...
          </span>
        ) : (
          children
        )}
        
        {/* Subtle gradient highlight effect */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </Button>
    );
  }
);

ScannerButton.displayName = "ScannerButton";

export { ScannerButton };
