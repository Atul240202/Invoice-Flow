
// 3. Updated DashboardLayout.jsx with inline logout logic
import { Outlet, Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "../components/sidebar/SidebarTrigger";
import { AppSidebar } from "./AppSideBar";
import { useSidebar } from "../components/sidebar/SidebarContext";
import { Button } from "../components/button";
import { LogOut } from "lucide-react";

export default function DashboardLayout() {
  const { isOpen } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout (optional - even if this fails, we'll clear local data)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log('Server logout failed, but continuing with local logout');
    } finally {
      // Always clear local storage and redirect (most important part)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken'); // if you use different key
      sessionStorage.clear();
      
      // Redirect to login
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isOpen ? "ml-80" : "ml-0"
        }`}
      >
        <header className="flex items-center justify-between h-20 gap-4 px-4 md:px-8 border-b shadow-md bg-white">
          {/* Left Section - Sidebar Trigger & Brand */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-12 w-12 text-black hover:bg-purple-100 hover:text-purple-700 rounded-lg transition duration-200 border border-gray-300 hover:border-purple-400 shadow-sm hover:shadow-md bg-white" />
            
            <div className="hidden sm:flex items-center gap-4">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow duration-200">
                <span className="text-white text-lg md:text-xl font-bold">IF</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl md:text-3xl text-gray-800">InvoiceFlow</span>
                <span className="text-xs md:text-sm text-gray-500 font-medium hidden md:block">
                  Professional Invoice Management
                </span>
              </div>
              <span className="hidden lg:inline-block ml-4 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs md:text-sm font-bold rounded-full shadow-md hover:shadow-lg transition duration-200">
                GST Compliant
              </span>
            </div>
          </div>

          {/* Right Section - Logout Button */}
          <div className="flex items-center">
            <Button
              onClick={handleLogout}
              className="group relative overflow-hidden bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium text-sm"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-rotate-12 duration-300 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}