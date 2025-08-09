import { useLocation, Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from ".";
import { NavLink } from "react-router-dom";

export function SidebarMenuList({ title, items }) {
  const location = useLocation();

  return (
    <SidebarGroup className="mt-8 first:mt-0">
      <SidebarGroupLabel className="text-cyan-600 font-semibold mb-3 text-sm uppercase tracking-wide">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-2">
             {items.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-white bg-gradient-to-br from-blue-500 to-cyan-600 shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </NavLink>
        ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
