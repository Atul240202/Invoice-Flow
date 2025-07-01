import { 
  BarChart3, 
  FileText, 
  Home, 
  Settings, 
  Users, 
  Receipt,
  Shield,
  TrendingDown,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "../components/Sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Create Invoice", url: "/create-invoice", icon: FileText },
  { title: "Invoice History", url: "/invoices", icon: Receipt },
  { title: "Client Management", url: "/clients", icon: Users },
  { title: "Expense Tracker", url: "/expenses", icon: TrendingDown },
  { title: "Reports & Analytics", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-slate-200 bg-white shadow-sm">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">IF</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900">InvoiceFlow</h2>
            <p className="text-sm text-slate-500 font-medium">GST Compliant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-700 font-semibold mb-3 text-sm uppercase tracking-wide">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.url 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105' 
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
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

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-purple-700 font-semibold mb-3 text-sm uppercase tracking-wide">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.url 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg transform scale-105' 
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
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
      </SidebarContent>
    </Sidebar>
  );
}
