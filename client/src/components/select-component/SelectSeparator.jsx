import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "../../lib/utils"

export const SelectSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export default SelectSeparator;