import { Outlet } from "react-router-dom";

import { SidebarTrigger } from "../components/Sidebar";

import { AppSidebar } from "./AppSideBar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="flex h-20 shrink-0 items-center gap-4 px-8 border-b-2 border-gray-200 bg-white shadow-lg">
          <SidebarTrigger className="h-12 w-12 text-black hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-all duration-200 border-2 border-gray-300 hover:border-purple-400 shadow-md hover:shadow-lg bg-white" />
         
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow duration-200">
              <span className="text-white text-xl font-bold">IF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-3xl text-black">InvoiceFlow</span>
              <span className="text-sm text-gray-600 font-medium">Professional Invoice Management</span>
            </div>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold rounded-full shadow-lg ml-6 hover:shadow-xl transition-shadow duration-200">
              GST Compliant
            </span>
          </div>
        </header>
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
