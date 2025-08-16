import React from "react";
import { cn, useTheme } from "./theme-provider";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
}) => {
  const theme = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen text-gray-200",
        theme.components.gradient,
        className
      )}
    >
      {children}
    </div>
  );
};

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  size = "xl",
}) => {
  const theme = useTheme();

  const sizeStyles = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: theme.layout.maxWidth,
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        sizeStyles[size],
        "mx-auto",
        theme.layout.containerPadding,
        className
      )}
    >
      {children}
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  spacing = "md",
}) => {
  const spacingStyles = {
    sm: "py-6",
    md: "py-12",
    lg: "py-20",
  };

  return (
    <section className={cn(spacingStyles[spacing], className)}>
      {children}
    </section>
  );
};

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = "md",
  className,
}) => {
  const colStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-12",
  };

  const gapStyles = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={cn("grid", colStyles[cols], gapStyles[gap], className)}>
      {children}
    </div>
  );
};

interface FlexProps {
  children: React.ReactNode;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = "row",
  align = "start",
  justify = "start",
  gap = "md",
  className,
}) => {
  const directionStyles = {
    row: "flex-row",
    col: "flex-col",
  };

  const alignStyles = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyStyles = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  const gapStyles = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={cn(
        "flex",
        directionStyles[direction],
        alignStyles[align],
        justifyStyles[justify],
        gapStyles[gap],
        className
      )}
    >
      {children}
    </div>
  );
};
