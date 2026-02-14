import React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "default" | "accent" | "secondary" | "link" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

type ButtonProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: ButtonVariant;
      size?: ButtonSize;
      asChild?: false;
      children?: React.ReactNode;
    })
  | (React.HTMLAttributes<HTMLElement> & {
      variant?: ButtonVariant;
      size?: ButtonSize;
      asChild: true;
      children: React.ReactElement;
    });

const baseClasses =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "px-8 py-4 text-base md:text-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  // Use the theme accent token (e.g., for standout CTAs).
  accent: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border border-foreground/30 bg-transparent text-foreground hover:bg-muted/60",
  link: "text-primary underline-offset-4 hover:underline",
  ghost: "text-foreground hover:bg-muted/60",
};

export function Button({
  variant = "default",
  size = "default",
  asChild,
  className,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ...props,
      className: cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (child.props as { className?: string }).className,
        className
      ),
    } as any);
  }
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
