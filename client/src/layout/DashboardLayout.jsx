import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSideBar";
import { useSidebar } from "../components/sidebar/SidebarContext";
import { Button } from "../components/button";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect } from "react";

export default function DashboardLayout() {
  const { isOpen, setIsOpen } = useSidebar();
  const navigate = useNavigate();

  // Close sidebar on mobile when route changes or screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    // Close sidebar on mobile initially
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const handleLogout = async () => {
    try {
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex relative bg-gray-50">
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <AppSidebar />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300
        ${isOpen ? 'md:ml-0' : 'ml-0'}
      `}>
        {/* Header */}
        <header className="flex items-center justify-between h-16 md:h-20 gap-4 px-4 md:px-6 lg:px-8 border-b border-gray-200 bg-white shadow-sm relative z-30">
          
          {/* Left Section - Menu Button & Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg border-none shadow-none"
              variant="ghost"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </Button>

            {/* Brand (shows when sidebar is closed or on mobile) */}
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${isOpen ? 'md:opacity-0 opacity-100' : 'opacity-100'}`}>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg md:text-xl font-bold">IF</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-lg md:text-xl text-gray-800">InvoiceFlow</span>
                <span className="text-xs md:text-sm text-gray-500 font-medium">
                  Professional Invoice Management
                </span>
              </div>
            </div>
          </div>

          {/* Center Section - Page Title */}
          <div className="hidden lg:flex items-center">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-full shadow-md">
              GST Compliant
            </span>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-3">
            {/* User Info - Hidden on mobile when sidebar is open */}
            <div className={`hidden md:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg transition-opacity duration-300 ${isOpen ? 'md:opacity-100' : 'opacity-100'}`}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">U</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">User Name</span>
                <span className="text-xs text-gray-600">Administrator</span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              className="group relative overflow-hidden bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-xl font-medium text-xs md:text-sm"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:-rotate-12 duration-300 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}