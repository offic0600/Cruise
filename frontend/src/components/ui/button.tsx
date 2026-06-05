import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-brand-gradient text-white shadow-brand hover:brightness-[1.03] active:translate-y-[1px]",
        secondary: "border-border-soft bg-[color:var(--interactive-default)] text-ink-700 hover:bg-[color:var(--interactive-hover)]",
        tertiary: "border-transparent bg-surface-soft text-ink-700 hover:bg-[color:var(--interactive-pressed)]",
        ghost: "border-transparent bg-transparent text-ink-700 hover:bg-[color:var(--interactive-hover)]",
        danger: "border-transparent bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:translate-y-[1px]",
        link: "border-transparent bg-transparent px-0 text-[color:var(--fg-brand)] hover:text-[color:var(--color-brand-500)]",
        default: "border-transparent bg-brand-gradient text-white shadow-brand hover:brightness-[1.03] active:translate-y-[1px]",
      },
      size: {
        xs: "h-[var(--button-height-xs)] px-2.5 text-xs",
        sm: "h-[var(--button-height-sm)] px-3 text-[13px]",
        default: "h-[var(--button-height-md)] px-4",
        md: "h-[var(--button-height-md)] px-4",
        lg: "h-[var(--button-height-lg)] px-4.5 text-[15px]",
        xl: "h-[var(--button-height-xl)] px-5 text-[15px]",
        icon: "h-[var(--button-height-md)] w-[var(--button-height-md)]",
        "icon-sm": "h-[var(--button-height-sm)] w-[var(--button-height-sm)]",
        "icon-md": "h-[var(--button-height-md)] w-[var(--button-height-md)]",
        "icon-lg": "h-[var(--button-height-lg)] w-[var(--button-height-lg)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
