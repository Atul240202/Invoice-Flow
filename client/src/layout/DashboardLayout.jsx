import { Outlet } from "react-router-dom";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";
import { AppSidebar } from "./AppSideBar";
import { useSidebar } from "../components/sidebar/SidebarContext";


export default function DashboardLayout() {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isOpen ? "ml-80" : "ml-0"
        }`}
      >
        <header className="flex items-center h-20 gap-4 px-8 border-b shadow-md">
          <SidebarTrigger className="h-12 w-12 text-black hover:bg-purple-100 hover:text-purple-700 rounded-lg transition duration-200 border border-gray-300 hover:border-purple-400 shadow-sm hover:shadow-md bg-white" />
          
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow duration-200">
              <span className="text-white text-xl font-bold">IF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-3xl text-gray-800">InvoiceFlow</span>
              <span className="text-sm text-gray-500 font-medium">Professional Invoice Management</span>
            </div>
            <span className="ml-6 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition duration-200">
              GST Compliant
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
