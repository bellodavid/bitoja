import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, useTheme } from "./theme-provider";

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent" | "feature" | "stat";
  hover?: boolean;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  className,
  variant = "default",
  hover = true,
}) => {
  const theme = useTheme();

  const variantStyles = {
    default: theme.components.card,
    accent: "bg-white/[0.04] border border-white/10",
    feature: "bg-white/[0.04] border border-white/10 backdrop-blur-md",
    stat: "bg-white/[0.04] border border-white/10 text-center",
  };

  const hoverClass = hover ? theme.components.cardHover : "";

  return (
    <Card className={cn(variantStyles[variant], hoverClass, className)}>
      {children}
    </Card>
  );
};

interface ThemedCardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ThemedCardHeader: React.FC<ThemedCardHeaderProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <CardHeader className={cn("pb-4", className)}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="w-10 h-10 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <CardTitle className="text-lg font-semibold text-white">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-gray-400 mt-1">
              {description}
            </CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  );
};

interface ThemedCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ThemedCardContent: React.FC<ThemedCardContentProps> = ({
  children,
  className,
}) => {
  return (
    <CardContent className={cn("text-gray-200", className)}>
      {children}
    </CardContent>
  );
};
