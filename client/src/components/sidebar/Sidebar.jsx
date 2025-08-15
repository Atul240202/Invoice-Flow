// Sidebar.jsx
import React from "react";
import { cn } from "../../lib/utils";

export function Sidebar({ className, children }) {
  return (
    <aside className={cn("w-68 h-screen overflow-y-auto", className)}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children }) {
  return <div className={cn("border-b px-4 py-6", className)}>{children}</div>;
}

export function SidebarContent({ className, children }) {
  return <div className={cn("px-2 py-4", className)}>{children}</div>;
}

export function SidebarMenu({ className, children }) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ className, children }) {
  return (
    <li className={cn("relative", className)}>
      {children}
    </li>
  );
}

export function SidebarMenuButton({ asChild, className, isActive, children, ...props }) {
  const Comp = asChild ? React.Fragment : "button";
  const activeClass =
    isActive
      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105"
      : "text-slate-700 hover:bg-purple-50 hover:text-purple-700";
  return (
    <Comp
      {...props}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        activeClass,
        className
      )}
    >
      {children}
    </Comp>
  );
}

