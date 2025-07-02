import React from "react";
import { cn } from "../lib/utils";

export function Label({ className, ...props }) {
  return (
    <label
      className={cn("block text-sm font-medium leading-6 text-gray-700", className)}
      {...props}
    />
  );
}
