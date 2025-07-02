import { useLocation, Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from ".";

export function SidebarMenuList({ title, items }) {
  const location = useLocation();

  return (
    <SidebarGroup className="mt-8 first:mt-0">
      <SidebarGroupLabel className="text-purple-700 font-semibold mb-3 text-sm uppercase tracking-wide">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.url
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105"
                    : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <Link to={item.url} className="flex items-center gap-4 w-full">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
