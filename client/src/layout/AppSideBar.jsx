import { useSidebar } from "../components/sidebar/SidebarContext";
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenuList } from "../components/sidebar";
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
import { NavLink } from "react-router-dom";

export function AppSidebar() {
  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
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

  const { isOpen } = useSidebar();

  return (
    <Sidebar
      className={`
        fixed top-0 left-0 h-full z-40
        border-r border-gray-200  shadow-lg transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
      `}
    >
      <SidebarHeader className="flex items-center gap-4 p-6 border-b border-gray-200">
        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">IF</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">InvoiceFlow</h1>
          <p className="text-sm text-gray-500">GST Compliant</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        <SidebarMenuList title="Main Menu" items={menuItems} />
        <SidebarMenuList title="Administration" items={adminItems} />
      </SidebarContent>
    </Sidebar>
  );
}
