import React from "react";
import { Button } from "@/components/ui/button";
import { cn, useTheme } from "./theme-provider";

interface ThemedButtonProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
  icon,
  iconPosition = "left",
  ...props
}) => {
  const theme = useTheme();

  const variantStyles = {
    primary: theme.components.button.primary,
    secondary: theme.components.button.secondary,
    outline: theme.components.button.outline,
    ghost: theme.components.button.ghost,
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  const content = icon ? (
    <div className="flex items-center space-x-2">
      {iconPosition === "left" && icon}
      <span>{children}</span>
      {iconPosition === "right" && icon}
    </div>
  ) : (
    children
  );

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-medium transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {content}
    </Button>
  );
};

// Specialized button variants for common use cases
export const PrimaryButton: React.FC<Omit<ThemedButtonProps, "variant">> = (
  props
) => <ThemedButton variant="primary" {...props} />;

export const SecondaryButton: React.FC<Omit<ThemedButtonProps, "variant">> = (
  props
) => <ThemedButton variant="secondary" {...props} />;

export const OutlineButton: React.FC<Omit<ThemedButtonProps, "variant">> = (
  props
) => <ThemedButton variant="outline" {...props} />;

export const GhostButton: React.FC<Omit<ThemedButtonProps, "variant">> = (
  props
) => <ThemedButton variant="ghost" {...props} />;
