// src/components/sidebar/SidebarTrigger.jsx
import { AlignLeft } from "lucide-react";
import { useSidebar } from "./SidebarContext"; // assumes Sidebar context API exists
import { Button } from "../button";

export function SidebarTrigger({ className }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      onClick={toggleSidebar}
      variant="ghost"
      size="icon"
      className={className}
    >
      <AlignLeft className="h-6 w-6" />
    </Button>
  );
}
