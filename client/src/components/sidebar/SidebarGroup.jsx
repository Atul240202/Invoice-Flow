import React from "react";
import { cn } from "../../lib/utils";

export function SidebarGroup({ className, children }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function SidebarGroupLabel({ className, children }) {
  return (
    <h4 className={cn("px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)}>
      {children}
    </h4>
  );
}

export function SidebarGroupContent({ className, children }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}
