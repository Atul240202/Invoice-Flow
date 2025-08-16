import { useSidebar } from "../components/sidebar/SidebarContext";
import { 
  BarChart3,
  FileText,
  Home,
  Settings,
  Users,
  Receipt,
  Shield,
  TrendingDown,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const location = useLocation();

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

  return (
    <div
      className={`
        h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-0 md:w-20"}
        overflow-hidden flex flex-col
      `}
    >

        {/* Sidebar Toggle Button - Always visible when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-3 left-4 z-50 p-2 rounded-lg border border-gray-300 shadow-sm bg-white hover:bg-blue-100 transition-all"
          aria-label="Expand sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      )}
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 flex-shrink-0 relative">
        {/* Logo and Brand - Only show when open */}
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">IF</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 whitespace-nowrap">InvoiceFlow</h1>
            <p className="text-xs md:text-sm text-gray-500 whitespace-nowrap">GST Compliant</p>
          </div>
        </div>


        {/* Sidebar Toggle Button */}
<button
  onClick={() => setIsOpen(!isOpen)}
  className={`
    p-2 rounded-lg border border-gray-300 shadow-sm hover:bg-blue-100 transition-all duration-200
    flex-shrink-0
    bg-white
    absolute top-8 right-4 
    ${isOpen ? '' : 'z-50'}
  `}
  aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
>
  {isOpen ? (
    <ChevronLeft className="h-5 w-5 text-gray-600" />
  ) : (
    <Menu className="h-5 w-5 text-gray-600" />
  )}
</button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 space-y-4 md:space-y-6 flex-1 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-2">
          {isOpen && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Main Menu
            </h3>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url || 
                              (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
              
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }
                    ${!isOpen ? 'justify-center md:px-3' : ''}
                  `}
                >
                  <Icon className={`
                    h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-transform duration-200
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                    ${!isActive && 'group-hover:scale-110'}
                  `} />
                  
                  <span className={`
                    font-medium text-sm md:text-base transition-opacity duration-300 whitespace-nowrap
                    ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}
                  `}>
                    {item.title}
                  </span>

                  {/* Active indicator */}
                  {isActive && isOpen && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Admin Menu */}
        <div className="space-y-2 border-t border-gray-200 pt-4">
          {isOpen && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Administration
            </h3>
          )}
          <div className="space-y-1">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url || 
                              location.pathname.startsWith(item.url);
              
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 768) {
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                    }
                    ${!isOpen ? 'justify-center md:px-3' : ''}
                  `}
                >
                  <Icon className={`
                    h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-transform duration-200
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'}
                    ${!isActive && 'group-hover:scale-110'}
                  `} />
                  
                  <span className={`
                    font-medium text-sm md:text-base transition-opacity duration-300 whitespace-nowrap
                    ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}
                  `}>
                    {item.title}
                  </span>

                  {/* Active indicator */}
                  {isActive && isOpen && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer - User Info */}
      <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className={`
          flex items-center gap-3 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}
          ${!isOpen ? 'justify-center' : ''}
        `}>
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm md:text-base font-bold">U</span>
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm md:text-base font-semibold text-gray-900 truncate">User Name</span>
              <span className="text-xs md:text-sm text-gray-600 truncate">user@company.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}